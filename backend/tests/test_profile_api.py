from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import UserProfile


class UserProfileApiContractTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="alice",
            password="strong-pass-123",
            email="alice@example.com",
            first_name="Alice",
            last_name="Reader",
        )
        self.profile = UserProfile.objects.create(user=self.user, bio="Original bio")
        self.client.force_authenticate(user=self.user)
        self.url = "/api/profile/"

    def test_get_profile_returns_flat_contract(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            set(response.data.keys()),
            {"id", "username", "email", "first_name", "last_name", "bio"},
        )
        self.assertEqual(response.data["id"], self.user.id)
        self.assertEqual(response.data["username"], "alice")
        self.assertEqual(response.data["email"], "alice@example.com")
        self.assertEqual(response.data["first_name"], "Alice")
        self.assertEqual(response.data["last_name"], "Reader")
        self.assertEqual(response.data["bio"], "Original bio")

    def test_patch_profile_updates_bio_only(self):
        response = self.client.patch(self.url, {"bio": "Updated bio"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.user.refresh_from_db()

        self.assertEqual(self.profile.bio, "Updated bio")
        self.assertEqual(self.user.email, "alice@example.com")

    def test_patch_profile_updates_user_fields(self):
        payload = {
            "email": "alice.new@example.com",
            "first_name": "Alicia",
            "last_name": "Booker",
        }

        response = self.client.patch(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()

        self.assertEqual(self.user.email, "alice.new@example.com")
        self.assertEqual(self.user.first_name, "Alicia")
        self.assertEqual(self.user.last_name, "Booker")

    def test_patch_profile_updates_mixed_fields(self):
        payload = {
            "email": "combo@example.com",
            "first_name": "Combo",
            "bio": "Mixed update",
        }

        response = self.client.patch(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.profile.refresh_from_db()

        self.assertEqual(self.user.email, "combo@example.com")
        self.assertEqual(self.user.first_name, "Combo")
        self.assertEqual(self.profile.bio, "Mixed update")

    def test_patch_profile_ignores_read_only_fields(self):
        payload = {
            "id": 9999,
            "username": "hacker-name",
            "bio": "Still valid",
        }

        response = self.client.patch(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.profile.refresh_from_db()

        self.assertEqual(self.user.id, response.data["id"])
        self.assertEqual(self.user.username, "alice")
        self.assertEqual(self.profile.bio, "Still valid")