from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

SEED_USERNAME_PREFIX = "seed_u_"
SEED_EMAIL_DOMAIN = "seed.library.local"
SEED_CATEGORY_PREFIX = "SEED-CAT:"
SEED_PUBLISHER_PREFIX = "SEED-PUB:"
SEED_BOOK_TITLE_PREFIX = "SEED-BOOK:"
SEED_ACCESSION_PREFIX = "SEED-ACC-"

DEFAULT_USER_PASSWORD = "SeedPass123!"
DEFAULT_SEED = 20260426
DEFAULT_BATCH_SIZE = 500

ROLE_WEIGHTS = {
    "student": 70,
    "staff": 20,
    "librarian": 10,
}

RESERVATION_STATUS_WEIGHTS = {
    "pending": 45,
    "ready": 30,
    "cancelled": 15,
    "fulfilled": 10,
}

FINE_STATUS_WEIGHTS = {
    "pending": 70,
    "paid": 20,
    "waived": 10,
}

DEPARTMENTS = {
    "student": [
        "Computer Science",
        "Business Administration",
        "Mechanical Engineering",
        "Mathematics",
        "History",
        "Biology",
        "Economics",
        "Architecture",
    ],
    "staff": [
        "Admissions",
        "Registrar Office",
        "Academic Affairs",
        "Student Services",
        "Finance Office",
        "IT Services",
    ],
    "librarian": [
        "Reference Services",
        "Digital Collections",
        "Technical Services",
        "Archives",
    ],
}

CATEGORY_TAXONOMY = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Literature",
    "History",
    "Economics",
    "Philosophy",
    "Psychology",
    "Civil Engineering",
    "Medicine",
]

PUBLISHER_NAMES = [
    "Pearson",
    "Springer",
    "Oxford University Press",
    "Cambridge University Press",
    "McGraw Hill",
    "Wiley",
    "Elsevier",
    "Taylor & Francis",
    "SAGE",
    "MIT Press",
]

SHELF_SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M"]

FINE_RATE_PER_DAY = Decimal("1.50")
FINE_MAX_AMOUNT = Decimal("150.00")


@dataclass(frozen=True)
class SeedProfile:
    name: str
    users: int
    books: int
    copies_per_book: int
    with_fines_percent: int
    with_overdue_percent: int


PROFILE_PRESETS = {
    "small": SeedProfile(
        name="small",
        users=30,
        books=40,
        copies_per_book=2,
        with_fines_percent=50,
        with_overdue_percent=25,
    ),
    "medium": SeedProfile(
        name="medium",
        users=120,
        books=200,
        copies_per_book=3,
        with_fines_percent=55,
        with_overdue_percent=30,
    ),
    "large": SeedProfile(
        name="large",
        users=350,
        books=1200,
        copies_per_book=4,
        with_fines_percent=60,
        with_overdue_percent=35,
    ),
}
