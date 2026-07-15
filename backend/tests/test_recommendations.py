from datetime import date, timedelta
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import CustomUser
from apps.catalog.models import Category, Book, Publisher, Wishlist, SearchHistory
from apps.inventory.models import BookCopy
from apps.circulation.models import Loan


class RecommendationsApiTests(APITestCase):
    def setUp(self):
        # Create categories
        self.cat_sci = Category.objects.create(name="Science")
        self.cat_his = Category.objects.create(name="History")
        self.cat_art = Category.objects.create(name="Art")
        
        # Create publisher
        self.pub = Publisher.objects.create(name="Test Publisher")
        
        # Create user
        self.user = CustomUser.objects.create_user(
            user_id="student1",
            password="password123",
            email="student1@example.com",
            role="student"
        )
        
        # Create books
        self.books = []
        for i in range(10):
            # 4 Science, 4 History, 2 Art
            if i < 4:
                cat = self.cat_sci
            elif i < 8:
                cat = self.cat_his
            else:
                cat = self.cat_art
                
            book = Book.objects.create(
                title=f"Book {i}",
                author=f"Author {i}",
                published_date=date.today(),
                isbn=f"123456789012{i}",
                category=cat,
                publisher=self.pub
            )
            self.books.append(book)
            
            # Create a copy for each book
            BookCopy.objects.create(
                book=book,
                accession_number=f"ACC-{i}",
                status=BookCopy.AVAILABLE
            )

        self.url = "/api/recommendations/personalized/"

    def test_unauthenticated_request_fails(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_new_user_recommendations(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return exactly 6 books
        self.assertEqual(len(response.data), 6)
        
    def test_user_history_recommendations(self):
        # Force authenticate
        self.client.force_authenticate(user=self.user)
        
        # Create history: User borrows 2 Science books and 1 History book
        copy0 = self.books[0].copies.first()
        copy1 = self.books[1].copies.first()
        copy4 = self.books[4].copies.first() # History book copy
        
        Loan.objects.create(
            copy=copy0,
            borrower=self.user,
            due_at=timezone.now() + timedelta(days=7)
        )
        Loan.objects.create(
            copy=copy1,
            borrower=self.user,
            due_at=timezone.now() + timedelta(days=7)
        )
        Loan.objects.create(
            copy=copy4,
            borrower=self.user,
            due_at=timezone.now() + timedelta(days=7)
        )
        
        # Call the endpoint
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 6)
        
        # The user has already read: Book 0, Book 1, Book 4.
        # These should NOT be recommended.
        recommended_ids = [b["id"] for b in response.data]
        self.assertNotIn(self.books[0].id, recommended_ids)
        self.assertNotIn(self.books[1].id, recommended_ids)
        self.assertNotIn(self.books[4].id, recommended_ids)
        
        # Favorite genre is Science (borrowed 2), followed by History (borrowed 1).
        # Unread Science books are: Book 2, Book 3.
        # The recommended books should prioritize unread Science books first.
        # Verify that Book 2 and Book 3 (Science) are the first in the list
        self.assertEqual(response.data[0]["id"], self.books[2].id)
        self.assertEqual(response.data[1]["id"], self.books[3].id)
        
        # Followed by unread History books (Book 5, 6, 7)
        history_recommended_ids = [response.data[2]["id"], response.data[3]["id"], response.data[4]["id"]]
        self.assertIn(self.books[5].id, history_recommended_ids)
        self.assertIn(self.books[6].id, history_recommended_ids)
        self.assertIn(self.books[7].id, history_recommended_ids)

    def test_new_user_recommendations_with_search_and_wishlist(self):
        # Use Case 1: A new user with no borrowing history
        self.client.force_authenticate(user=self.user)
        
        # Add a book from Art category to wishlist (Book 8)
        Wishlist.objects.create(user=self.user, book=self.books[8])
        
        # User searches for "History" (should recommend History books)
        SearchHistory.objects.create(user=self.user, query="History")
        
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 6)
        
        recommended_ids = [b["id"] for b in response.data]
        
        # 1. Wishlist book (Book 8) should be recommended and rank high (score 1000)
        self.assertEqual(response.data[0]["id"], self.books[8].id)
        
        # 2. Search query matching books (History books: Book 4, 5, 6, 7) should rank high (score 500)
        # Verify History books are in the top recommendations
        history_ids = [self.books[4].id, self.books[5].id, self.books[6].id, self.books[7].id]
        for h_id in history_ids:
            self.assertIn(h_id, recommended_ids)
            
        # 3. Art category match (Book 9) gets category match (score 200)
        self.assertIn(self.books[9].id, recommended_ids)

    def test_user_history_recommendations_with_borrow_search_and_wishlist(self):
        # Use Case 2: User with borrowing history, search history, and wishlist
        self.client.force_authenticate(user=self.user)
        
        # Borrow a Science book (Book 0)
        copy0 = self.books[0].copies.first()
        Loan.objects.create(
            copy=copy0,
            borrower=self.user,
            due_at=timezone.now() + timedelta(days=7)
        )
        
        # Search query matching Book 5 exact name
        SearchHistory.objects.create(user=self.user, query="Book 5")
        
        # Wishlist Book 8 (Art)
        Wishlist.objects.create(user=self.user, book=self.books[8])
        
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 6)
        
        recommended_ids = [b["id"] for b in response.data]
        
        # 1. Borrowed book (Book 0) should NOT be recommended
        self.assertNotIn(self.books[0].id, recommended_ids)
        
        # 2. Wishlisted book (Book 8) is highly scored (1000) -> First
        self.assertEqual(response.data[0]["id"], self.books[8].id)
        
        # 3. Searched book (Book 5) is scored (500) -> Second
        self.assertEqual(response.data[1]["id"], self.books[5].id)
        
        # 4. Borrowed category (Science) unborrowed books (Book 1, 2, 3) are recommended next
        science_ids = [self.books[1].id, self.books[2].id, self.books[3].id]
        for s_id in science_ids:
            self.assertIn(s_id, recommended_ids)
