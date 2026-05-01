from __future__ import annotations

import random
from datetime import date, timedelta
from typing import Any

from django.contrib.auth.models import User

from apps.catalog.models import Book, Category, Publisher
from seeding.constants import SEED_BOOK_TITLE_PREFIX
from seeding.random_utils import isbn13_for


def seed_books(
    *,
    count: int,
    seed: int,
    faker: Any,
    categories: list[Category],
    publishers: list[Publisher],
    contributors: list[User],
) -> tuple[list[Book], dict[str, int]]:
    """Create deterministic seeded books with realistic publication metadata."""
    counters = {
        "books_created": 0,
        "books_updated": 0,
    }

    if count <= 0:
        return [], counters

    isbn_values = [isbn13_for(seed, idx) for idx in range(count)]
    existing_by_isbn = {
        book.isbn: book
        for book in Book.objects.filter(isbn__in=isbn_values)
    }

    books_to_create: list[Book] = []
    books_to_update: list[Book] = []

    today = date.today()
    oldest_date = date(1970, 1, 1)

    for idx, isbn in enumerate(isbn_values):
        title = f"{SEED_BOOK_TITLE_PREFIX}{faker.catch_phrase()}"
        author = faker.name()
        published_date = faker.date_between_dates(date_start=oldest_date, date_end=today - timedelta(days=30))

        category = random.choice(categories) if categories and random.random() > 0.1 else None
        publisher = random.choice(publishers) if publishers and random.random() > 0.1 else None
        added_by = random.choice(contributors) if contributors and random.random() > 0.15 else None

        existing = existing_by_isbn.get(isbn)
        if existing is None:
            books_to_create.append(
                Book(
                    title=title,
                    author=author,
                    published_date=published_date,
                    isbn=isbn,
                    category=category,
                    publisher=publisher,
                    added_by=added_by,
                )
            )
            continue

        dirty = False
        if existing.title != title:
            existing.title = title
            dirty = True
        if existing.author != author:
            existing.author = author
            dirty = True
        if existing.published_date != published_date:
            existing.published_date = published_date
            dirty = True
        if existing.category_id != (category.id if category else None):
            existing.category = category
            dirty = True
        if existing.publisher_id != (publisher.id if publisher else None):
            existing.publisher = publisher
            dirty = True
        if existing.added_by_id != (added_by.id if added_by else None):
            existing.added_by = added_by
            dirty = True

        if dirty:
            books_to_update.append(existing)

    if books_to_create:
        Book.objects.bulk_create(books_to_create, batch_size=500)
        counters["books_created"] = len(books_to_create)

    if books_to_update:
        Book.objects.bulk_update(
            books_to_update,
            ["title", "author", "published_date", "category", "publisher", "added_by"],
            batch_size=500,
        )
        counters["books_updated"] = len(books_to_update)

    books = list(Book.objects.filter(isbn__in=isbn_values).order_by("id"))
    return books, counters
