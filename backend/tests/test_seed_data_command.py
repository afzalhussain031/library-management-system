from __future__ import annotations

from django.contrib.auth.models import User
from django.core.management import call_command
from django.db import models
from django.test import TestCase

from apps.billing.models import Fine
from apps.circulation.models import Loan
from apps.inventory.models import BookCopy
from seeding.constants import SEED_USERNAME_PREFIX


class SeedDataCommandTests(TestCase):
    def test_command_runs_and_creates_data(self):
        call_command(
            "seed_data",
            profile="small",
            users=12,
            books=18,
            copies_per_book=2,
            seed=101,
            with_fines_percent=60,
            with_overdue_percent=35,
        )

        self.assertGreater(User.objects.filter(username__startswith=SEED_USERNAME_PREFIX).count(), 0)
        self.assertGreater(BookCopy.objects.filter(accession_number__startswith="SEED-ACC-").count(), 0)

    def test_idempotent_rerun_same_seed(self):
        kwargs = {
            "profile": "small",
            "users": 10,
            "books": 15,
            "copies_per_book": 2,
            "seed": 202,
            "with_fines_percent": 65,
            "with_overdue_percent": 40,
        }

        call_command("seed_data", **kwargs)
        first_user_count = User.objects.filter(username__startswith=SEED_USERNAME_PREFIX).count()
        first_copy_count = BookCopy.objects.filter(accession_number__startswith="SEED-ACC-").count()

        call_command("seed_data", **kwargs)
        second_user_count = User.objects.filter(username__startswith=SEED_USERNAME_PREFIX).count()
        second_copy_count = BookCopy.objects.filter(accession_number__startswith="SEED-ACC-").count()

        self.assertEqual(first_user_count, second_user_count)
        self.assertEqual(first_copy_count, second_copy_count)

    def test_relationship_integrity_after_seed(self):
        call_command(
            "seed_data",
            profile="small",
            users=14,
            books=20,
            copies_per_book=2,
            seed=303,
            with_fines_percent=50,
            with_overdue_percent=30,
        )

        self.assertEqual(
            Loan.objects.filter(returned_at__isnull=True).exclude(copy__status=BookCopy.LOANED).count(),
            0,
        )
        self.assertEqual(
            Loan.objects.filter(returned_at__isnull=False).exclude(copy__status=BookCopy.AVAILABLE).count(),
            0,
        )

    def test_fines_only_for_overdue_returned_loans(self):
        call_command(
            "seed_data",
            profile="small",
            users=16,
            books=25,
            copies_per_book=2,
            seed=404,
            with_fines_percent=100,
            with_overdue_percent=60,
        )

        invalid_fines = Fine.objects.filter(loan__returned_at__isnull=True).count()
        invalid_fines += Fine.objects.filter(loan__returned_at__isnull=False, loan__returned_at__lte=models.F("loan__due_at")).count()
        self.assertEqual(invalid_fines, 0)

    def test_reset_preserves_non_seeded_user(self):
        User.objects.create_superuser(username="admin", email="admin@example.com", password="admin-pass-123")
        User.objects.create_user(username="real_user", email="real@example.com", password="real-pass-123")

        call_command(
            "seed_data",
            profile="small",
            users=8,
            books=10,
            copies_per_book=1,
            seed=505,
        )
        call_command(
            "seed_data",
            profile="small",
            users=0,
            books=0,
            copies_per_book=0,
            seed=505,
            reset=True,
        )

        self.assertTrue(User.objects.filter(username="admin", is_superuser=True).exists())
        self.assertTrue(User.objects.filter(username="real_user").exists())
        self.assertEqual(User.objects.filter(username__startswith=SEED_USERNAME_PREFIX).count(), 0)
