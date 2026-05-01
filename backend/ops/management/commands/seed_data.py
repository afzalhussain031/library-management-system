from __future__ import annotations

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from seeding.constants import DEFAULT_SEED, PROFILE_PRESETS
from seeding.orchestrator import SeedOptions, SeedOrchestrator
from seeding.reporting import render_summary


class Command(BaseCommand):
    help = "Seed realistic deterministic development data across library domains."

    def add_arguments(self, parser):
        parser.add_argument("--users", type=int, default=None, help="Number of users to seed")
        parser.add_argument("--books", type=int, default=None, help="Number of books to seed")
        parser.add_argument(
            "--copies-per-book",
            type=int,
            default=None,
            help="Number of book copies to seed per book",
        )
        parser.add_argument("--seed", type=int, default=DEFAULT_SEED, help="Deterministic random seed")
        parser.add_argument("--reset", action="store_true", help="Delete existing seeded records first")
        parser.add_argument("--dry-run", action="store_true", help="Execute seeding and rollback all writes")
        parser.add_argument(
            "--profile",
            choices=tuple(PROFILE_PRESETS.keys()),
            default="small",
            help="Size profile for default values",
        )
        parser.add_argument(
            "--with-fines-percent",
            type=int,
            default=None,
            help="Percent chance that an overdue returned loan gets a fine",
        )
        parser.add_argument(
            "--with-overdue-percent",
            type=int,
            default=None,
            help="Percent chance a loan is overdue",
        )

    def handle(self, *args, **options):
        seed_options = SeedOptions(
            users=options["users"],
            books=options["books"],
            copies_per_book=options["copies_per_book"],
            seed=options["seed"],
            reset=options["reset"],
            profile=options["profile"],
            with_fines_percent=self._percent_or_none(options["with_fines_percent"], "with-fines-percent"),
            with_overdue_percent=self._percent_or_none(options["with_overdue_percent"], "with-overdue-percent"),
        )

        orchestrator = SeedOrchestrator()
        with transaction.atomic():
            result = orchestrator.run(seed_options)
            if result.validation.critical_errors:
                transaction.set_rollback(True)
                self.stdout.write(render_summary(result.counters, result.validation, dry_run=options["dry_run"]))
                raise CommandError("Seeding failed critical integrity checks.")
            if options["dry_run"]:
                transaction.set_rollback(True)

        self.stdout.write(render_summary(result.counters, result.validation, dry_run=options["dry_run"]))

    @staticmethod
    def _percent_or_none(value: int | None, option_name: str) -> int | None:
        if value is None:
            return None
        if value < 0 or value > 100:
            raise CommandError(f"--{option_name} must be between 0 and 100")
        return value
