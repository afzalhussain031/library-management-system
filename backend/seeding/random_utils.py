from __future__ import annotations

import random
from typing import Sequence, TypeVar

from faker import Faker

T = TypeVar("T")


def initialize_deterministic_seed(seed: int) -> Faker:
    """Initialize module-level and Faker random state for deterministic runs."""
    random.seed(seed)
    Faker.seed(seed)
    faker = Faker()
    faker.seed_instance(seed)
    return faker


def chance(percent: int) -> bool:
    """Return True based on an integer percentage in [0, 100]."""
    if percent <= 0:
        return False
    if percent >= 100:
        return True
    return random.random() * 100 < percent


def weighted_choice(weights: dict[str, int]) -> str:
    """Pick a key from a weight map."""
    keys = list(weights.keys())
    values = list(weights.values())
    return random.choices(keys, weights=values, k=1)[0]


def pick_random(items: Sequence[T]) -> T:
    """Pick a random item from a non-empty sequence."""
    return items[random.randrange(0, len(items))]


def isbn13_for(seed: int, index: int) -> str:
    """Build a deterministic, valid ISBN-13 string from seed and index."""
    base = f"{abs(seed) % 1_000_000:06d}{index % 1_000_000:06d}"
    checksum = _ean13_checksum(base)
    return f"{base}{checksum}"


def _ean13_checksum(first_twelve_digits: str) -> int:
    total = 0
    for idx, digit_char in enumerate(first_twelve_digits):
        digit = int(digit_char)
        if idx % 2 == 0:
            total += digit
        else:
            total += digit * 3
    return (10 - (total % 10)) % 10
