from __future__ import annotations

from decimal import Decimal

from django.db import models

from apps.billing.models import Fine
from apps.circulation.models import Loan
from seeding.constants import FINE_MAX_AMOUNT, FINE_RATE_PER_DAY, FINE_STATUS_WEIGHTS
from seeding.random_utils import chance, weighted_choice


def seed_fines(*, with_fines_percent: int) -> tuple[list[Fine], dict[str, int]]:
    """Create fines from overdue returned loans and enforce OneToOne uniqueness."""
    counters = {
        "fine_candidates": 0,
        "fines_created": 0,
    }

    overdue_returned_loans = list(
        Loan.objects.filter(returned_at__isnull=False).filter(returned_at__gt=models.F("due_at"))
    )
    if not overdue_returned_loans:
        return [], counters

    counters["fine_candidates"] = len(overdue_returned_loans)
    existing_loan_ids = set(Fine.objects.filter(loan__in=overdue_returned_loans).values_list("loan_id", flat=True))

    to_create: list[Fine] = []
    for loan in overdue_returned_loans:
        if loan.id in existing_loan_ids:
            continue
        if not chance(with_fines_percent):
            continue

        overdue_days = max(1, (loan.returned_at - loan.due_at).days)
        amount = min(FINE_MAX_AMOUNT, (Decimal(overdue_days) * FINE_RATE_PER_DAY).quantize(Decimal("0.01")))

        to_create.append(
            Fine(
                loan=loan,
                amount=amount,
                reason=f"{overdue_days} day(s) overdue",
                status=weighted_choice(FINE_STATUS_WEIGHTS),
            )
        )

    if to_create:
        Fine.objects.bulk_create(to_create, batch_size=500)
        counters["fines_created"] = len(to_create)

    created_ids = [fine.id for fine in to_create if fine.id is not None]
    created_fines = list(Fine.objects.filter(id__in=created_ids).select_related("loan"))
    return created_fines, counters
