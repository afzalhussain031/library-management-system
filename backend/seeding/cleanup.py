from __future__ import annotations

from django.contrib.auth.models import User

from apps.accounts.models import UserProfile
from apps.billing.models import Fine
from apps.catalog.models import Book, Category, Publisher
from apps.circulation.models import Loan, Reservation
from apps.inventory.models import BookCopy
from seeding.constants import (
    SEED_ACCESSION_PREFIX,
    SEED_BOOK_TITLE_PREFIX,
    SEED_CATEGORY_PREFIX,
    SEED_PUBLISHER_PREFIX,
    SEED_USERNAME_PREFIX,
)


def reset_seeded_data() -> dict[str, int]:
    """Delete only seeded records in reverse dependency order."""
    counters = {
        "fines_deleted": 0,
        "reservations_deleted": 0,
        "loans_deleted": 0,
        "copies_deleted": 0,
        "books_deleted": 0,
        "categories_deleted": 0,
        "publishers_deleted": 0,
        "profiles_deleted": 0,
        "users_deleted": 0,
    }

    seeded_user_ids = list(User.objects.filter(username__startswith=SEED_USERNAME_PREFIX).values_list("id", flat=True))
    seeded_book_ids = list(Book.objects.filter(title__startswith=SEED_BOOK_TITLE_PREFIX).values_list("id", flat=True))
    seeded_copy_ids = list(
        BookCopy.objects.filter(accession_number__startswith=SEED_ACCESSION_PREFIX).values_list("id", flat=True)
    )

    fine_qs = Fine.objects.filter(loan__copy_id__in=seeded_copy_ids)
    counters["fines_deleted"], _ = fine_qs.delete()

    reservation_qs = Reservation.objects.filter(book_id__in=seeded_book_ids, user_id__in=seeded_user_ids)
    counters["reservations_deleted"], _ = reservation_qs.delete()

    loan_qs = Loan.objects.filter(copy_id__in=seeded_copy_ids)
    counters["loans_deleted"], _ = loan_qs.delete()

    copy_qs = BookCopy.objects.filter(id__in=seeded_copy_ids)
    counters["copies_deleted"], _ = copy_qs.delete()

    book_qs = Book.objects.filter(id__in=seeded_book_ids)
    counters["books_deleted"], _ = book_qs.delete()

    category_qs = Category.objects.filter(name__startswith=SEED_CATEGORY_PREFIX)
    counters["categories_deleted"], _ = category_qs.delete()

    publisher_qs = Publisher.objects.filter(name__startswith=SEED_PUBLISHER_PREFIX)
    counters["publishers_deleted"], _ = publisher_qs.delete()

    profile_qs = UserProfile.objects.filter(user_id__in=seeded_user_ids)
    counters["profiles_deleted"], _ = profile_qs.delete()

    user_qs = User.objects.filter(id__in=seeded_user_ids, is_superuser=False)
    counters["users_deleted"], _ = user_qs.delete()

    return counters
