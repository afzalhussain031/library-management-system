from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "library_category"

    def __str__(self):
        return self.name


class Publisher(models.Model):
    name = models.CharField(max_length=150, unique=True)
    address = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = "library_publisher"

    def __str__(self):
        return self.name


class Language(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = "library_language"

    def __str__(self):
        return self.name


class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    published_date = models.DateField()
    isbn = models.CharField(max_length=13, unique=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="books",
    )
    publisher = models.ForeignKey(
        Publisher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="books",
    )
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="added_books",
    )
    language = models.ForeignKey(
        Language,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="books",
    )

    class Meta:
        db_table = "library_book"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.description and self.isbn:
            from .utils import fetch_and_truncate_description
            fetched_desc = fetch_and_truncate_description(self.isbn)
            if fetched_desc:
                self.description = fetched_desc
        super().save(*args, **kwargs)


class Wishlist(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wishlist_items",
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name="wishlist_by",
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "library_wishlist"
        unique_together = ("user", "book")

    def __str__(self):
        return f"{self.user.user_id} - {self.book.title}"

class Review(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    review_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "library_review"
        unique_together = ("user", "book")

    def __str__(self):
        return f"{self.user.user_id} - {self.book.title} ({self.rating}/5)"
