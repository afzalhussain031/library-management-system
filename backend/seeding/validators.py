from __future__ import annotations

from django.contrib.auth.models import User
from django.db.models import Count, F

from apps.accounts.models import UserProfile
from apps.billing.models import Fine
from apps.circulation.models import Loan, Reservation
from apps.inventory.models import BookCopy
from seeding.constants import SEED_ACCESSION_PREFIX, SEED_USERNAME_PREFIX
from seeding.types import ValidationReport


def run_validations() -> ValidationReport:
    """Validate seeded relationship and status invariants."""
    report = ValidationReport()

    seeded_users = User.objects.filter(username__startswith=SEED_USERNAME_PREFIX, is_superuser=False)
    seeded_user_ids = list(seeded_users.values_list("id", flat=True))

    missing_profiles = seeded_users.exclude(userprofile__isnull=False).count()
    report.checks["seeded_non_superusers"] = len(seeded_user_ids)
    report.checks["users_missing_profiles"] = missing_profiles
    if missing_profiles:
        report.critical_errors.append(f"{missing_profiles} seeded users are missing UserProfile records.")

    bad_due_dates = Loan.objects.filter(copy__accession_number__startswith=SEED_ACCESSION_PREFIX, due_at__lte=F("issued_at")).count()
    report.checks["loans_due_after_issue"] = bad_due_dates
    if bad_due_dates:
        report.critical_errors.append(f"{bad_due_dates} seeded loans have due_at <= issued_at.")

    bad_return_dates = Loan.objects.filter(
        copy__accession_number__startswith=SEED_ACCESSION_PREFIX,
        returned_at__isnull=False,
        returned_at__lt=F("issued_at"),
    ).count()
    report.checks["returned_after_issue_violations"] = bad_return_dates
    if bad_return_dates:
        report.critical_errors.append(f"{bad_return_dates} seeded returned loans have returned_at < issued_at.")

    active_status_mismatch = Loan.objects.filter(
        copy__accession_number__startswith=SEED_ACCESSION_PREFIX,
        returned_at__isnull=True,
    ).exclude(copy__status=BookCopy.LOANED).count()
    report.checks["active_loan_copy_status_mismatch"] = active_status_mismatch
    if active_status_mismatch:
        report.critical_errors.append(
            f"{active_status_mismatch} active seeded loans are not backed by loaned copies."
        )

    returned_status_mismatch = Loan.objects.filter(
        copy__accession_number__startswith=SEED_ACCESSION_PREFIX,
        returned_at__isnull=False,
    ).exclude(copy__status=BookCopy.AVAILABLE).count()
    report.checks["returned_loan_copy_status_mismatch"] = returned_status_mismatch
    if returned_status_mismatch:
        report.warnings.append(
            f"{returned_status_mismatch} returned seeded loans have copies not currently available."
        )

    invalid_fines = Fine.objects.filter(loan__returned_at__isnull=True).count() + Fine.objects.filter(
        loan__returned_at__isnull=False,
        loan__returned_at__lte=F("loan__due_at"),
    ).count()
    report.checks["fine_date_violations"] = invalid_fines
    if invalid_fines:
        report.critical_errors.append(f"{invalid_fines} fines exist for non-overdue loans.")

    duplicate_open_reservations = (
        Reservation.objects.filter(status__in=[Reservation.PENDING, Reservation.READY])
        .values("book_id", "user_id")
        .annotate(pair_count=Count("id"))
        .filter(pair_count__gt=1)
        .count()
    )
    report.checks["duplicate_open_reservation_pairs"] = duplicate_open_reservations
    if duplicate_open_reservations:
        report.critical_errors.append(
            f"{duplicate_open_reservations} duplicate open reservation pairs detected."
        )

    orphan_profiles = UserProfile.objects.filter(user__isnull=True).count()
    report.checks["orphan_profiles"] = orphan_profiles
    if orphan_profiles:
        report.critical_errors.append(f"{orphan_profiles} orphaned UserProfile rows detected.")

    return report
