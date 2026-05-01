from django.contrib.auth.models import User
from rest_framework import serializers

from .models import UserProfile, Membership


class BaseUserRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    is_staff_user = False

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value

    def validate(self, data):
        if data.get("password") != data.get("password2"):
            raise serializers.ValidationError({"password2": "Passwords do not match"})
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        user.is_staff = self.is_staff_user
        user.save(update_fields=["is_staff"])

        try:
            UserProfile.objects.create(user=user)
        except Exception:
            pass

        return user


class RegisterSerializer(BaseUserRegistrationSerializer):
    """Public registration always creates non-staff users."""

    is_staff_user = False


class StaffCreateSerializer(BaseUserRegistrationSerializer):
    """Serializer for creating staff users via protected endpoints."""

    is_staff_user = True


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


class UserProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", required=False, allow_blank=True)
    first_name = serializers.CharField(source="user.first_name", required=False, allow_blank=True)
    last_name = serializers.CharField(source="user.last_name", required=False, allow_blank=True)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "bio",
            "student_name",
            "enrollment_number",
            "father_name",
            "mother_name",
            "batch",
            "address",
            "phone_number",
            "department",
            "student_id",
            "role",
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})

        user_changed_fields = []
        for field in ("email", "first_name", "last_name"):
            if field in user_data:
                setattr(instance.user, field, user_data[field])
                user_changed_fields.append(field)

        if user_changed_fields:
            instance.user.save(update_fields=user_changed_fields)

        profile_fields_to_update = [
            "bio",
            "student_name",
            "enrollment_number",
            "father_name",
            "mother_name",
            "batch",
            "address",
            "phone_number",
            "department",
            "student_id",
            "role",
        ]

        profile_changed_fields = []
        for field in profile_fields_to_update:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
                profile_changed_fields.append(field)

        if profile_changed_fields:
            instance.save(update_fields=profile_changed_fields)

        return instance


class MembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = ["id", "membership_id", "valid_till", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]