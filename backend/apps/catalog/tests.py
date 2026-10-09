from django.test import TestCase
from unittest.mock import patch, MagicMock
from apps.catalog.utils import fetch_and_truncate_description
from apps.catalog.models import Book
from datetime import date
from django.core.management import call_command


class CatalogUtilsTests(TestCase):
    @patch('requests.get')
    def test_fetch_and_truncate_description_dict(self, mock_get):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "ISBN:1234567890": {
                "details": {
                    "description": {
                        "value": "This is a book description that is very nice and complete."
                    }
                }
            }
        }
        mock_get.return_value = mock_response
        
        desc = fetch_and_truncate_description("1234567890")
        self.assertEqual(desc, "This is a book description that is very nice and complete.")

    @patch('requests.get')
    def test_fetch_and_truncate_description_string(self, mock_get):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "ISBN:1234567890": {
                "details": {
                    "description": "Short description."
                }
            }
        }
        mock_get.return_value = mock_response
        
        desc = fetch_and_truncate_description("1234567890")
        self.assertEqual(desc, "Short description.")

    @patch('requests.get')
    def test_fetch_and_truncate_description_truncation(self, mock_get):
        long_desc = "Word " * 100
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "ISBN:1234567890": {
                "details": {
                    "description": long_desc
                }
            }
        }
        mock_get.return_value = mock_response
        
        desc = fetch_and_truncate_description("1234567890")
        self.assertTrue(len(desc) <= 304)
        self.assertTrue(desc.endswith("..."))

    @patch('requests.get')
    def test_fetch_and_truncate_description_google_fallback(self, mock_get):
        # First call (Open Library) returns no description
        mock_ol_response = MagicMock()
        mock_ol_response.json.return_value = {}
        
        # Second call (Google Books) returns a description
        mock_gb_response = MagicMock()
        mock_gb_response.json.return_value = {
            "items": [
                {
                    "volumeInfo": {
                        "description": "Google Books description."
                    }
                }
            ]
        }
        
        mock_get.side_effect = [mock_ol_response, mock_gb_response]
        
        desc = fetch_and_truncate_description("1234567890")
        self.assertEqual(desc, "Google Books description.")
        self.assertEqual(mock_get.call_count, 2)


class BookModelTests(TestCase):
    @patch('apps.catalog.utils.fetch_and_truncate_description')
    def test_save_fetches_description_if_empty(self, mock_fetch):
        mock_fetch.return_value = "Fetched description."
        
        book = Book.objects.create(
            title="Test Book 1",
            author="Author 1",
            published_date=date(2023, 1, 1),
            isbn="1111111111",
            description=""
        )
        
        mock_fetch.assert_called_once_with("1111111111")
        self.assertEqual(book.description, "Fetched description.")

    @patch('apps.catalog.utils.fetch_and_truncate_description')
    def test_save_does_not_fetch_if_description_exists(self, mock_fetch):
        book = Book.objects.create(
            title="Test Book 2",
            author="Author 2",
            published_date=date(2023, 1, 1),
            isbn="2222222222",
            description="Existing description."
        )
        
        mock_fetch.assert_not_called()
        self.assertEqual(book.description, "Existing description.")



class ManagementCommandTests(TestCase):
    @patch('apps.catalog.management.commands.fetch_descriptions.fetch_and_truncate_description')
    def test_management_command_updates_empty_descriptions(self, mock_fetch):
        mock_fetch.return_value = "Fetched command description."
        
        book1 = Book.objects.create(
            title="Empty Desc Book",
            author="Author 1",
            published_date=date(2023, 1, 1),
            isbn="12345",
            description="temp"
        )
        Book.objects.filter(id=book1.id).update(description="")
        
        book2 = Book.objects.create(
            title="Filled Desc Book",
            author="Author 2",
            published_date=date(2023, 1, 1),
            isbn="67890",
            description="Existing description."
        )
        
        call_command("fetch_descriptions")
        
        book1.refresh_from_db()
        book2.refresh_from_db()
        
        self.assertEqual(book1.description, "Fetched command description.")
        self.assertEqual(book2.description, "Existing description.")


class BookSerializerTests(TestCase):
    def test_isbn_hyphen_sanitization(self):
        from apps.catalog.serializers import BookSerializer
        data = {
            "title": "Engineering Mechanics",
            "author": "R. S. Khurmi",
            "published_date": "2002-04-05",
            "isbn": "978-8121926164",
        }
        serializer = BookSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["isbn"], "9788121926164")

    def test_invalid_isbn_length(self):
        from apps.catalog.serializers import BookSerializer
        data = {
            "title": "Invalid ISBN Book",
            "author": "Author",
            "published_date": "2023-01-01",
            "isbn": "12345",
        }
        serializer = BookSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("isbn", serializer.errors)


class BulkUploadTests(TestCase):
    def setUp(self):
        from apps.accounts.models import CustomUser
        from rest_framework.test import APIClient
        self.client = APIClient()
        self.admin = CustomUser.objects.create_superuser(
            user_id="ADMIN001",
            email="admin@test.com",
            password="adminpassword123"
        )
        self.client.force_authenticate(user=self.admin)

    def test_bulk_upload_success(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        from apps.catalog.models import Book, Category, Publisher
        from apps.inventory.models import BookCopy

        csv_content = (
            "S.NO.,ISBN,Name of the book,Author,Publisher,Required Quantity,Sem.\n"
            "1,978-8121926164,Engineering Mechanics,R.S. Khurmi,S Chand,3,I/II\n"
            "\n"
            "2,978-9350143803,Basic Mechanical Engineering,D S Kumar,S K Kataria,2,I/II\n"
        ).encode("utf-8")

        uploaded_file = SimpleUploadedFile("books.csv", csv_content, content_type="text/csv")
        response = self.client.post("/api/books/bulk-upload/", {"file": uploaded_file}, format="multipart")

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["created_books"], 2)
        self.assertEqual(response.data["created_copies"], 5)
        self.assertEqual(len(response.data["errors"]), 0)

        # Check DB records
        book1 = Book.objects.get(isbn="9788121926164")
        self.assertEqual(book1.title, "Engineering Mechanics")
        self.assertEqual(book1.publisher.name, "S Chand")
        self.assertEqual(book1.category.name, "Semester I/II")
        self.assertEqual(BookCopy.objects.filter(book=book1).count(), 3)

    def test_bulk_upload_idempotency_no_duplicate_copies(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        from apps.catalog.models import Book
        from apps.inventory.models import BookCopy

        csv_content = (
            "S.NO.,ISBN,Name of the book,Author,Publisher,Required Quantity,Sem.\n"
            "1,978-8121926164,Engineering Mechanics,R.S. Khurmi,S Chand,3,I/II\n"
        ).encode("utf-8")

        # First upload
        uploaded_file = SimpleUploadedFile("books.csv", csv_content, content_type="text/csv")
        response = self.client.post("/api/books/bulk-upload/", {"file": uploaded_file}, format="multipart")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["created_copies"], 3)
        book = Book.objects.get(isbn="9788121926164")
        self.assertEqual(BookCopy.objects.filter(book=book).count(), 3)

        # Second upload with identical file (simulating re-upload)
        uploaded_file2 = SimpleUploadedFile("books.csv", csv_content, content_type="text/csv")
        response2 = self.client.post("/api/books/bulk-upload/", {"file": uploaded_file2}, format="multipart")
        self.assertEqual(response2.status_code, 200)
        self.assertEqual(response2.data["created_copies"], 0)
        self.assertEqual(response2.data["existing_books"], 1)
        # Total copies must remain exactly 3, NOT 6!
        self.assertEqual(BookCopy.objects.filter(book=book).count(), 3)

    def test_bulk_upload_duplicate_isbn_conflict_detection(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        from apps.catalog.models import Book
        from apps.inventory.models import BookCopy

        # Two different titles sharing the same ISBN
        csv_content = (
            "S.NO.,ISBN,Name of the book,Author,Publisher,Required Quantity,Sem.\n"
            "1,9788126554270,Operating System Concepts,Silberschatz,Wiley,37,IV\n"
            "2,9788126554270,Operating Systems,Andrew S. Tanenbaum,PHI,15,IV\n"
        ).encode("utf-8")

        uploaded_file = SimpleUploadedFile("books.csv", csv_content, content_type="text/csv")
        response = self.client.post("/api/books/bulk-upload/", {"file": uploaded_file}, format="multipart")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["created_books"], 1)
        self.assertEqual(len(response.data["errors"]), 1)
        self.assertIn("already registered", response.data["errors"][0]["reason"])

        # Copies for book 1 should be 37, NOT 37 + 15 = 52
        book = Book.objects.get(isbn="9788126554270")
        self.assertEqual(BookCopy.objects.filter(book=book).count(), 37)

    def test_bulk_delete_books(self):
        from apps.catalog.models import Book
        from datetime import date

        b1 = Book(title="Book One", isbn="1111111111", published_date=date(2020, 1, 1))
        b1.save(skip_desc_fetch=True)
        b2 = Book(title="Book Two", isbn="2222222222", published_date=date(2020, 1, 1))
        b2.save(skip_desc_fetch=True)

        res = self.client.post("/api/books/bulk-delete/", {"book_ids": [b1.id, b2.id]}, format="json")
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data["deleted_count"], 2)
        self.assertFalse(Book.objects.filter(id__in=[b1.id, b2.id]).exists())

    def test_bulk_delete_with_active_loans_protected(self):
        from apps.catalog.models import Book
        from apps.inventory.models import BookCopy
        from apps.circulation.models import Loan
        from apps.accounts.models import CustomUser
        from datetime import date, timedelta
        from django.utils import timezone

        borrower = CustomUser.objects.create_user(
            user_id="BORROWER01",
            email="borrower@test.com",
            password="password123"
        )

        b_safe = Book(title="Safe Book", isbn="3333333333", published_date=date(2020, 1, 1))
        b_safe.save(skip_desc_fetch=True)

        b_loaned = Book(title="Loaned Book", isbn="4444444444", published_date=date(2020, 1, 1))
        b_loaned.save(skip_desc_fetch=True)
        copy = BookCopy.objects.create(book=b_loaned, accession_number="LOAN-001", status="loaned")
        Loan.objects.create(copy=copy, borrower=borrower, due_at=timezone.now() + timedelta(days=14))

        res = self.client.post("/api/books/bulk-delete/", {"book_ids": [b_safe.id, b_loaned.id]}, format="json")
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data["deleted_count"], 1)
        self.assertEqual(res.data["protected_count"], 1)
        self.assertFalse(Book.objects.filter(id=b_safe.id).exists())
        self.assertTrue(Book.objects.filter(id=b_loaned.id).exists())



