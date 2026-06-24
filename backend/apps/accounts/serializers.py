from apps.accounts.models import CustomUser, Membership
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

CustomUser = get_user_model()

# ===== REGISTRATION SERIALIZERS =====


class CustomUserRegistrationSerializer(serializers.ModelSerializer):
    """Register new user (student or staff)"""

    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = [
            "user_id",
            "email",
            "password",
            "password2",
            "first_name",
            "last_name",
            "phone_number",
            "department",
            "student_name",
        ]
        extra_kwargs = {
            "first_name": {"required": False},
            "last_name": {"required": False},
            "student_name": {"required": False},
            "email": {"required": True},
            "role": {"required": False},
        }

    def validate_user_id(self, value):
        """Validate user_id format and uniqueness"""
        if CustomUser.objects.filter(user_id=value).exists():
            raise serializers.ValidationError("This ID is already registered")
        return value

    def validate_email(self, value):
        """Email must be unique"""
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def validate_password(self, value):
        """Validate password strength"""
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def validate(self, data):
        """Check passwords match"""
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match"})
        return data

    def create(self, validated_data):
        """Create user without storing password2"""
        password = validated_data.pop("password")
        validated_data.pop("password2")

        user = CustomUser.objects.create_user(**validated_data, password=password)
        return user


class StaffCreateSerializer(serializers.ModelSerializer):
    """For protected staff creation endpoint"""

    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = [
            "user_id",
            "email",
            "password",
            "password2",
            "first_name",
            "last_name",
            "phone_number",
            "department",
        ]

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match"})
        return data

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data.pop("password2")
        validated_data["role"] = "staff"

        user = CustomUser.objects.create_user(
            **validated_data, password=password, is_staff=True
        )
        return user


# ===== PROFILE SERIALIZERS =====


class CustomUserProfileSerializer(serializers.ModelSerializer):
    """Read user profile"""

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "user_id",
            "role",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "department",
            "student_name",
            "father_name",
            "mother_name",
            "batch",
            "address",
            "bio",
            "is_staff",
            "is_superuser",
            "date_joined",
        ]
        read_only_fields = [
            "id",
            "user_id",
            "role",
            "date_joined",
            "is_staff",
            "is_superuser",
        ]


class CustomUserUpdateSerializer(serializers.ModelSerializer):
    """Update user profile (limited fields)"""

    class Meta:
        model = CustomUser
        fields = [
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "department",
            "bio",
            "address",
            "student_name",
            "father_name",
            "mother_name",
            "batch",
        ]
        extra_kwargs = {
            "email": {"required": False},
        }


# ===== PASSWORD CHANGE SERIALIZER =====


class PasswordChangeSerializer(serializers.Serializer):
    """Change password for authenticated user"""

    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, min_length=8)
    new_password2 = serializers.CharField(write_only=True, required=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def validate(self, data):
        if data["new_password"] != data["new_password2"]:
            raise serializers.ValidationError(
                {"new_password2": "Passwords do not match"}
            )
        if data["new_password"] == data["old_password"]:
            raise serializers.ValidationError(
                {"new_password": "New password must be different from old password"}
            )
        return data

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


# ===== PASSWORD RESET SERIALIZERS =====


class ForgotPasswordSerializer(serializers.Serializer):
    """Request password reset token"""

    email = serializers.EmailField()

    def validate_email(self, value):
        if not CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist")
        return value


class ResetPasswordSerializer(serializers.Serializer):
    """Reset password with token"""

    user_id = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password2 = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(str(e))
        return value

    def validate(self, data):
        if data["new_password"] != data["new_password2"]:
            raise serializers.ValidationError(
                {"new_password2": "Passwords do not match"}
            )
        return data
