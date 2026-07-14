from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from apps.catalog.models import Book, Wishlist
from apps.inventory.models import BookCopy
from apps.circulation.models import Loan

User = get_user_model()

class DashboardStatsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            user_id="student_1",
            email="student@example.com",
            password="testpassword123",
            role="student",
            student_name="Test Student"
        )
        self.client.force_authenticate(user=self.user)
        self.url = "/api/me/dashboard/"

        self.book1 = Book.objects.create(
            title="Book 1",
            author="Author 1",
            isbn="1234567890",
            published_date="2020-01-01"
        )
        self.copy1 = BookCopy.objects.create(
            book=self.book1,
            accession_number="ACC001",
            status=BookCopy.AVAILABLE
        )

        self.book2 = Book.objects.create(
            title="Book 2",
            author="Author 2",
            isbn="0987654321",
            published_date="2020-01-01"
        )
        self.copy2 = BookCopy.objects.create(
            book=self.book2,
            accession_number="ACC002",
            status=BookCopy.AVAILABLE
        )

    def test_dashboard_stats_empty(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lib_info = response.data.get("library_information", {})
        self.assertEqual(lib_info.get("currently_borrowed"), 0)
        self.assertEqual(lib_info.get("total_borrowed"), 0)
        self.assertEqual(lib_info.get("pending_fines"), 0.0)
        self.assertEqual(lib_info.get("due_soon"), 0)
        self.assertEqual(lib_info.get("wishlist"), 0)

    def test_dashboard_stats_with_wishlist(self):
        Wishlist.objects.create(user=self.user, book=self.book1)
        
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lib_info = response.data.get("library_information", {})
        self.assertEqual(lib_info.get("wishlist"), 1)

    def test_dashboard_stats_with_due_soon_and_later_loans(self):
        now = timezone.now()
        
        # Loan due in 3 days (should count as due soon)
        self.copy1.status = BookCopy.LOANED
        self.copy1.save()
        Loan.objects.create(
            copy=self.copy1,
            borrower=self.user,
            issued_at=now,
            due_at=now + timedelta(days=3)
        )

        # Loan due in 10 days (should NOT count as due soon)
        self.copy2.status = BookCopy.LOANED
        self.copy2.save()
        Loan.objects.create(
            copy=self.copy2,
            borrower=self.user,
            issued_at=now,
            due_at=now + timedelta(days=10)
        )

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lib_info = response.data.get("library_information", {})
        self.assertEqual(lib_info.get("currently_borrowed"), 2)
        self.assertEqual(lib_info.get("total_borrowed"), 2)
        self.assertEqual(lib_info.get("due_soon"), 1)
