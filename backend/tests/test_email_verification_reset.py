from django.contrib.auth import get_user_model
from django.core import mail
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework.test import APITestCase
from rest_framework import status
from apps.accounts.emails import email_verification_token_generator
from django.contrib.auth.tokens import default_token_generator

CustomUser = get_user_model()


class EmailVerificationAndResetTests(APITestCase):

    def setUp(self):
        self.register_url = reverse("register")
        self.login_url = reverse("token_obtain_pair")
        self.verify_url = reverse("verify-email")
        self.forgot_password_url = reverse("forgot-password")
        self.reset_password_url = reverse("reset-password")

        self.user_data = {
            "user_id": "ST12345",
            "email": "student@example.com",
            "password": "SecurePassword123!",
            "password2": "SecurePassword123!",
            "student_name": "John Doe",
        }

    def test_registration_sends_verification_email(self):
        # 1. Register a new user
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 2. Check user is created but is_verified is False
        user = CustomUser.objects.get(user_id="ST12345")
        self.assertFalse(user.is_verified)

        # 3. Check verification email is sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, "Verify your email for Library Management System")
        self.assertIn(user.email, mail.outbox[0].to)

    def test_unverified_login_fails(self):
        # 1. Create an unverified user
        user = CustomUser.objects.create_user(
            user_id="ST99999",
            email="unverified@example.com",
            password="SecurePassword123!",
            is_verified=False
        )

        # Clear mail outbox
        mail.outbox.clear()

        # 2. Try to log in
        login_data = {
            "user_id": "ST99999",
            "password": "SecurePassword123!"
        }
        response = self.client.post(self.login_url, login_data)
        
        # 3. Should fail with 401
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Your email is not verified", response.data["detail"])

        # 4. Should NOT have sent another verification email
        self.assertEqual(len(mail.outbox), 0)

    def test_email_verification_success(self):
        # 1. Create an unverified user
        user = CustomUser.objects.create_user(
            user_id="ST88888",
            email="verify_me@example.com",
            password="SecurePassword123!",
            is_verified=False
        )

        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = email_verification_token_generator.make_token(user)

        # 2. Call the verify email endpoint
        verify_data = {
            "uid": uidb64,
            "token": token
        }
        response = self.client.post(self.verify_url, verify_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 3. User should now be verified
        user.refresh_from_db()
        self.assertTrue(user.is_verified)

        # 4. Login should now succeed
        login_data = {
            "user_id": "ST88888",
            "password": "SecurePassword123!"
        }
        login_response = self.client.post(self.login_url, login_data)
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

    def test_forgot_password_sends_email(self):
        # 1. Create a user
        user = CustomUser.objects.create_user(
            user_id="ST77777",
            email="forgot@example.com",
            password="SecurePassword123!",
            is_verified=True
        )

        # Clear mail outbox
        mail.outbox.clear()

        # 2. Request password reset
        forgot_data = {
            "email": "forgot@example.com"
        }
        response = self.client.post(self.forgot_password_url, forgot_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 3. Check password reset email is sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, "Password Reset Request - Library Management System")
        self.assertIn(user.email, mail.outbox[0].to)

    def test_reset_password_success(self):
        # 1. Create a user
        user = CustomUser.objects.create_user(
            user_id="ST66666",
            email="reset@example.com",
            password="OldPassword123!",
            is_verified=True
        )

        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # 2. Reset password
        reset_data = {
            "user_id": uidb64,
            "token": token,
            "new_password": "NewSecurePassword123!",
            "new_password2": "NewSecurePassword123!"
        }
        response = self.client.post(self.reset_password_url, reset_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 3. Verify login succeeds with the new password
        login_data = {
            "user_id": "ST66666",
            "password": "NewSecurePassword123!"
        }
        login_response = self.client.post(self.login_url, login_data)
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
