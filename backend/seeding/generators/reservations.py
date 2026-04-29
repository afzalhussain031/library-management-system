from __future__ import annotations

import random
from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone

from apps.catalog.models import Book
from apps.circulation.models import Reservation
from seeding.constants import SEED_BOOK_TITLE_PREFIX, SEED_USERNAME_PREFIX
from seeding.constants import RESERVATION_STATUS_WEIGHTS
from seeding.random_utils import weighted_choice

OPEN_RESERVATION_STATUSES = {Reservation.PENDING, Reservation.READY}


def seed_reservations(*, users: list[User], books: list[Book]) -> tuple[list[Reservation], dict[str, int]]:
    """Create weighted reservation records while avoiding duplicate open reservations."""
    counters = {
        "reservations_created": 0,
        "reservations_skipped_duplicate_open": 0,
    }

    if not users or not books:
        return [], counters

    target_count = int(len(books) * 0.4)
    if target_count <= 0:
        return [], counters

    existing_seeded_reservations = Reservation.objects.filter(
        user__username__startswith=SEED_USERNAME_PREFIX,
        book__title__startswith=SEED_BOOK_TITLE_PREFIX,
    ).exists()
    if existing_seeded_reservations:
        return [], counters

    user_ids = [user.id for user in users]
    book_ids = [book.id for book in books]

    existing_open_pairs = set(
        Reservation.objects.filter(
            user_id__in=user_ids,
            book_id__in=book_ids,
            status__in=OPEN_RESERVATION_STATUSES,
        ).values_list("user_id", "book_id")
    )

    now = timezone.now()
    reservations_to_create: list[Reservation] = []
    staged_open_pairs: set[tuple[int, int]] = set()
    reserved_at_values: list = []

    for _ in range(target_count):
        user = random.choice(users)
        book = random.choice(books)
        status = weighted_choice(RESERVATION_STATUS_WEIGHTS)

        if status in OPEN_RESERVATION_STATUSES:
            pair = (user.id, book.id)
            if pair in existing_open_pairs or pair in staged_open_pairs:
                counters["reservations_skipped_duplicate_open"] += 1
                continue
            staged_open_pairs.add(pair)

        reserved_at = now - timedelta(days=random.randint(0, 40), hours=random.randint(0, 22))
        reserved_at_values.append(reserved_at)
        reservations_to_create.append(
            Reservation(
                user=user,
                book=book,
                status=status,
                reserved_at=reserved_at,
            )
        )

    if reservations_to_create:
        Reservation.objects.bulk_create(reservations_to_create, batch_size=500)
        for idx, reservation in enumerate(reservations_to_create):
            reservation.reserved_at = reserved_at_values[idx]
        Reservation.objects.bulk_update(
            reservations_to_create,
            fields=["reserved_at", "status"],
            batch_size=500,
        )
        counters["reservations_created"] = len(reservations_to_create)

    created_ids = [reservation.id for reservation in reservations_to_create if reservation.id is not None]
    created = list(Reservation.objects.filter(id__in=created_ids))
    return created, counters
