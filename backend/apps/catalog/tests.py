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

