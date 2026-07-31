from django.core.management.base import BaseCommand
from apps.catalog.models import Book
from apps.catalog.utils import fetch_and_truncate_description

class Command(BaseCommand):
    help = "Fetch descriptions from Open Library API for books where description is empty."

    def handle(self, *args, **options):
        books = Book.objects.filter(description="")
        count = books.count()
        self.stdout.write(f"Found {count} books with empty description.")
        
        success_count = 0
        for book in books:
            if book.isbn:
                self.stdout.write(f"Fetching description for '{book.title}' (ISBN: {book.isbn})...")
                desc = fetch_and_truncate_description(book.isbn)
                if desc:
                    book.description = desc
                    book.save()
                    success_count += 1
                    self.stdout.write(self.style.SUCCESS(f"Successfully updated description for '{book.title}'."))
                else:
                    self.stdout.write(self.style.WARNING(f"Could not fetch description for '{book.title}'."))
            else:
                self.stdout.write(self.style.WARNING(f"Skipping '{book.title}' (No ISBN)."))
                
        self.stdout.write(self.style.SUCCESS(f"Completed! Successfully updated {success_count} books."))
