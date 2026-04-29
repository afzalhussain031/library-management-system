from __future__ import annotations

from typing import Any

from apps.catalog.models import Category, Publisher
from seeding.constants import (
    CATEGORY_TAXONOMY,
    PUBLISHER_NAMES,
    SEED_CATEGORY_PREFIX,
    SEED_PUBLISHER_PREFIX,
)


def seed_categories_and_publishers(*, faker: Any) -> tuple[list[Category], list[Publisher], dict[str, int]]:
    """Create reusable category and publisher records for seeded catalog data."""
    counters = {
        "categories_created": 0,
        "categories_updated": 0,
        "publishers_created": 0,
        "publishers_updated": 0,
    }

    category_rows = [
        (
            f"{SEED_CATEGORY_PREFIX}{name}",
            f"Seeded taxonomy category for {name.lower()} resources.",
        )
        for name in CATEGORY_TAXONOMY
    ]

    publisher_rows = [
        f"{SEED_PUBLISHER_PREFIX}{name}"
        for name in PUBLISHER_NAMES
    ]

    existing_categories = {
        category.name: category
        for category in Category.objects.filter(name__in=[name for name, _ in category_rows])
    }
    existing_publishers = {
        publisher.name: publisher
        for publisher in Publisher.objects.filter(name__in=publisher_rows)
    }

    categories_to_create: list[Category] = []
    categories_to_update: list[Category] = []
    for name, description in category_rows:
        existing = existing_categories.get(name)
        if existing is None:
            categories_to_create.append(Category(name=name, description=description))
            continue
        if existing.description != description:
            existing.description = description
            categories_to_update.append(existing)

    publishers_to_create: list[Publisher] = []
    publishers_to_update: list[Publisher] = []
    for name in publisher_rows:
        address = faker.address().replace("\n", ", ")[:255]
        existing = existing_publishers.get(name)
        if existing is None:
            publishers_to_create.append(Publisher(name=name, address=address))
            continue
        if existing.address != address:
            existing.address = address
            publishers_to_update.append(existing)

    if categories_to_create:
        Category.objects.bulk_create(categories_to_create, batch_size=200)
        counters["categories_created"] = len(categories_to_create)

    if categories_to_update:
        Category.objects.bulk_update(categories_to_update, ["description"], batch_size=200)
        counters["categories_updated"] = len(categories_to_update)

    if publishers_to_create:
        Publisher.objects.bulk_create(publishers_to_create, batch_size=200)
        counters["publishers_created"] = len(publishers_to_create)

    if publishers_to_update:
        Publisher.objects.bulk_update(publishers_to_update, ["address"], batch_size=200)
        counters["publishers_updated"] = len(publishers_to_update)

    categories = list(Category.objects.filter(name__startswith=SEED_CATEGORY_PREFIX).order_by("id"))
    publishers = list(Publisher.objects.filter(name__startswith=SEED_PUBLISHER_PREFIX).order_by("id"))
    return categories, publishers, counters
