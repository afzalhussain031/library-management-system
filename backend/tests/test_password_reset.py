from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APITestCase

CustomUser = get_user_model()


class PasswordResetWorkflowTests(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            user_id="STU999",
            email="student999@example.com",
            password="InitialStrongPassword123!",
            role="student",
        )
        self.forgot_url = "/api/forgot-password/"
        self.verify_url = "/api/reset-password/verify/"
        self.reset_url = "/api/reset-password/"

    def test_forgot_password_sends_email_for_existing_user(self):
        response = self.client.post(self.forgot_url, {"email": "student999@example.com"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("instructions have been sent", response.data["detail"])
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Reset Your Library Account Password", mail.outbox[0].subject)
        self.assertIn("/reset-password?uid=", mail.outbox[0].body)

    def test_forgot_password_returns_success_for_non_existent_user_without_leaking(self):
        response = self.client.post(self.forgot_url, {"email": "unknown@example.com"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("instructions have been sent", response.data["detail"])
        # Ensure no email was dispatched
        self.assertEqual(len(mail.outbox), 0)

    def test_verify_token_endpoint_with_valid_and_invalid_tokens(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        # 1. Valid token
        res_valid = self.client.get(f"{self.verify_url}?uid={uid}&token={token}")
        self.assertEqual(res_valid.status_code, status.HTTP_200_OK)
        self.assertTrue(res_valid.json()["valid"])

        # 2. Tampered token
        res_invalid = self.client.get(f"{self.verify_url}?uid={uid}&token=bogus-token-123")
        self.assertEqual(res_invalid.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(res_invalid.json()["valid"])

        # 3. Tampered uid
        res_bad_uid = self.client.get(f"{self.verify_url}?uid=invalid-base64&token={token}")
        self.assertEqual(res_bad_uid.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(res_bad_uid.json()["valid"])

    def test_reset_password_updates_password_and_invalidates_token(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        new_pass = "BrandNewSuperSecretPass999!"
        payload = {
            "user_id": uid,
            "token": token,
            "new_password": new_pass,
            "new_password2": new_pass,
        }

        response = self.client.post(self.reset_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["detail"], "Password has been reset successfully.")

        # Verify database updated
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(new_pass))

        # Verify old token can no longer be used
        response_reuse = self.client.post(self.reset_url, payload)
        self.assertEqual(response_reuse.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_rejects_mismatched_passwords(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        payload = {
            "user_id": uid,
            "token": token,
            "new_password": "NewValidPassword123!",
            "new_password2": "DifferentPassword123!",
        }

        response = self.client.post(self.reset_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password2", response.data)
