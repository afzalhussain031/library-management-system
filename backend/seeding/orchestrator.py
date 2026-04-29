from __future__ import annotations

from dataclasses import dataclass

from django.contrib.auth.models import User

from apps.accounts.models import UserProfile
from seeding.cleanup import reset_seeded_data
from seeding.constants import PROFILE_PRESETS
from seeding.generators.books import seed_books
from seeding.generators.catalog import seed_categories_and_publishers
from seeding.generators.circulation import seed_loans
from seeding.generators.copies import seed_copies
from seeding.generators.fines import seed_fines
from seeding.generators.reservations import seed_reservations
from seeding.generators.users import seed_users_and_profiles
from seeding.random_utils import initialize_deterministic_seed
from seeding.types import SeedExecutionResult
from seeding.validators import run_validations


@dataclass(frozen=True)
class SeedOptions:
    users: int | None
    books: int | None
    copies_per_book: int | None
    seed: int
    reset: bool
    profile: str
    with_fines_percent: int | None
    with_overdue_percent: int | None


class SeedOrchestrator:
    """Coordinates domain seeders in dependency order."""

    def run(self, options: SeedOptions) -> SeedExecutionResult:
        profile = PROFILE_PRESETS[options.profile]

        users_count = options.users if options.users is not None else profile.users
        books_count = options.books if options.books is not None else profile.books
        copies_per_book = (
            options.copies_per_book
            if options.copies_per_book is not None
            else profile.copies_per_book
        )
        with_fines_percent = (
            options.with_fines_percent
            if options.with_fines_percent is not None
            else profile.with_fines_percent
        )
        with_overdue_percent = (
            options.with_overdue_percent
            if options.with_overdue_percent is not None
            else profile.with_overdue_percent
        )

        counters: dict[str, int] = {
            "requested_users": users_count,
            "requested_books": books_count,
            "requested_copies_per_book": copies_per_book,
            "seed_value": options.seed,
            "with_fines_percent": with_fines_percent,
            "with_overdue_percent": with_overdue_percent,
        }

        faker = initialize_deterministic_seed(options.seed)

        if options.reset:
            counters.update(reset_seeded_data())

        users, user_counts = seed_users_and_profiles(count=users_count, faker=faker, seed=options.seed)
        counters.update(user_counts)

        categories, publishers, catalog_counts = seed_categories_and_publishers(faker=faker)
        counters.update(catalog_counts)

        contributors = list(
            User.objects.filter(
                id__in=UserProfile.objects.filter(role__in=["staff", "librarian"]).values_list("user_id", flat=True)
            )
        )

        books, book_counts = seed_books(
            count=books_count,
            seed=options.seed,
            faker=faker,
            categories=categories,
            publishers=publishers,
            contributors=contributors,
        )
        counters.update(book_counts)

        copies, copy_counts = seed_copies(books=books, copies_per_book=copies_per_book)
        counters.update(copy_counts)

        _, loan_counts = seed_loans(
            users=users,
            copies=copies,
            seed=options.seed,
            with_overdue_percent=with_overdue_percent,
        )
        counters.update(loan_counts)

        _, reservation_counts = seed_reservations(users=users, books=books)
        counters.update(reservation_counts)

        _, fine_counts = seed_fines(with_fines_percent=with_fines_percent)
        counters.update(fine_counts)

        validation = run_validations()
        counters["validation_warnings"] = len(validation.warnings)
        counters["validation_critical_errors"] = len(validation.critical_errors)

        return SeedExecutionResult(counters=counters, validation=validation)
