from __future__ import annotations

import random
from datetime import timedelta

from apps.catalog.models import Book
from apps.inventory.models import BookCopy
from seeding.constants import SEED_ACCESSION_PREFIX, SHELF_SECTIONS


def seed_copies(*, books: list[Book], copies_per_book: int) -> tuple[list[BookCopy], dict[str, int]]:
    """Create deterministic copy inventory with realistic accession and shelf data."""
    counters = {
        "copies_created": 0,
        "copies_updated": 0,
    }

    if copies_per_book <= 0 or not books:
        return [], counters

    accession_numbers: list[str] = []
    payload: dict[str, tuple[int, str, str, object]] = {}

    for book in books:
        for idx in range(copies_per_book):
            accession = f"{SEED_ACCESSION_PREFIX}{book.id:06d}-{idx + 1:03d}"
            accession_numbers.append(accession)

            section = random.choice(SHELF_SECTIONS)
            shelf_location = f"{section}-{random.randint(1, 30):02d}-{random.randint(1, 20):02d}-{idx + 1:02d}"

            status = BookCopy.AVAILABLE
            if random.random() < 0.08:
                status = BookCopy.RESERVED
            elif random.random() < 0.05:
                status = BookCopy.MAINTENANCE

            acquired_at = None
            if book.published_date:
                if random.random() < 0.95:
                    acquired_at = book.published_date + timedelta(days=random.randint(30, 3650))
                else:
                    acquired_at = book.published_date - timedelta(days=random.randint(5, 365))

            payload[accession] = (book.id, status, shelf_location, acquired_at)

    existing_by_accession = {
        copy.accession_number: copy
        for copy in BookCopy.objects.filter(accession_number__in=accession_numbers)
    }

    books_by_id = {book.id: book for book in books}
    to_create: list[BookCopy] = []
    to_update: list[BookCopy] = []

    for accession, (book_id, status, shelf_location, acquired_at) in payload.items():
        existing = existing_by_accession.get(accession)
        if existing is None:
            to_create.append(
                BookCopy(
                    book=books_by_id[book_id],
                    accession_number=accession,
                    status=status,
                    shelf_location=shelf_location,
                    acquired_at=acquired_at,
                )
            )
            continue

        dirty = False
        if existing.book_id != book_id:
            existing.book = books_by_id[book_id]
            dirty = True
        if existing.shelf_location != shelf_location:
            existing.shelf_location = shelf_location
            dirty = True
        if existing.acquired_at != acquired_at:
            existing.acquired_at = acquired_at
            dirty = True
        if existing.status in {BookCopy.AVAILABLE, BookCopy.RESERVED, BookCopy.MAINTENANCE} and existing.status != status:
            existing.status = status
            dirty = True

        if dirty:
            to_update.append(existing)

    if to_create:
        BookCopy.objects.bulk_create(to_create, batch_size=1000)
        counters["copies_created"] = len(to_create)

    if to_update:
        BookCopy.objects.bulk_update(to_update, ["book", "status", "shelf_location", "acquired_at"], batch_size=1000)
        counters["copies_updated"] = len(to_update)

    copies = list(BookCopy.objects.filter(accession_number__in=accession_numbers).select_related("book").order_by("id"))
    return copies, counters
