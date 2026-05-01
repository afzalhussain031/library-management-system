from __future__ import annotations

import random
from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone

from apps.circulation.models import Loan
from apps.inventory.models import BookCopy
from seeding.random_utils import chance


def seed_loans(
    *,
    users: list[User],
    copies: list[BookCopy],
    seed: int,
    with_overdue_percent: int,
) -> tuple[list[Loan], dict[str, int]]:
    """Create realistic active and historical loans while preserving copy state invariants."""
    counters = {
        "loans_created": 0,
        "active_loans_created": 0,
        "historical_loans_created": 0,
    }

    if not users or not copies:
        return [], counters

    borrower_pool = [user for user in users if not user.is_superuser]
    available_copies = [copy for copy in copies if copy.status == BookCopy.AVAILABLE]
    if not borrower_pool or not available_copies:
        return [], counters

    target_count = int(len(copies) * 0.35)
    if target_count <= 0:
        return [], counters

    selected = sorted(copies, key=lambda copy: copy.accession_number)[:target_count]
    if not selected:
        return [], counters

    now = timezone.now()
    loans_to_create: list[Loan] = []
    copies_to_update: list[BookCopy] = []
    issued_at_values: list = []

    for copy in selected:
        marker_note = f"Seeded loan record|seed={seed}|copy={copy.accession_number}"
        if Loan.objects.filter(notes=marker_note).exists():
            continue
        if copy.status != BookCopy.AVAILABLE:
            continue

        borrower = random.choice(borrower_pool)
        issued_at = now - timedelta(days=random.randint(10, 120), hours=random.randint(0, 23))
        due_at = issued_at + timedelta(days=random.randint(7, 30))

        returned = chance(70)
        returned_at = None
        renewed_count = 0

        if chance(20):
            renewed_count = random.randint(1, 2)

        if returned:
            if chance(with_overdue_percent):
                returned_at = due_at + timedelta(days=random.randint(1, 20), hours=random.randint(0, 23))
            else:
                returned_at = issued_at + timedelta(
                    days=random.randint(1, max(2, (due_at - issued_at).days)),
                    hours=random.randint(0, 23),
                )
                if returned_at > due_at:
                    returned_at = due_at

            copy.status = BookCopy.AVAILABLE
            counters["historical_loans_created"] += 1
        else:
            if chance(with_overdue_percent):
                issued_at = now - timedelta(days=random.randint(20, 120), hours=random.randint(0, 23))
                due_at = issued_at + timedelta(days=random.randint(7, 14))
                if due_at >= now:
                    due_at = now - timedelta(days=random.randint(1, 5), hours=random.randint(0, 23))
            else:
                due_at = now + timedelta(days=random.randint(1, 20))

            copy.status = BookCopy.LOANED
            counters["active_loans_created"] += 1

        copies_to_update.append(copy)
        issued_at_values.append(issued_at)
        loans_to_create.append(
            Loan(
                copy=copy,
                borrower=borrower,
                issued_at=issued_at,
                due_at=due_at,
                returned_at=returned_at,
                renewed_count=renewed_count,
                notes=marker_note,
            )
        )

    if loans_to_create:
        Loan.objects.bulk_create(loans_to_create, batch_size=500)
        for idx, loan in enumerate(loans_to_create):
            loan.issued_at = issued_at_values[idx]
        Loan.objects.bulk_update(loans_to_create, fields=["issued_at"], batch_size=500)
        counters["loans_created"] = len(loans_to_create)

    if copies_to_update:
        BookCopy.objects.bulk_update(copies_to_update, fields=["status"], batch_size=1000)

    created_ids = [loan.id for loan in loans_to_create if loan.id is not None]
    created_loans = list(Loan.objects.filter(id__in=created_ids).select_related("copy", "borrower"))
    return created_loans, counters
