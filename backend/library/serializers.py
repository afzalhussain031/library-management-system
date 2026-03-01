from rest_framework import serializers
from .models import Book, UserProfile
from django.contrib.auth.models import User
from .models import UserProfile
from django.conf import settings

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    # invite_code removed: frontend must NOT control roles

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value

    def validate(self, data):
        if data.get("password") != data.get("password2"):
            raise serializers.ValidationError({"password2": "Passwords do not match"})
        return data
    
    def create(self, validated_data):
        username = validated_data["username"]
        email = validated_data.get("email", "")
        password = validated_data["password"]
        # Always create public registrations as non-staff. Staff accounts must be created
        # by an authenticated staff/admin via a protected endpoint.

        user = User.objects.create_user(username=username, email=email, password=password)
        user.is_staff = False
        user.save()

        # create profile if your model expects it
        try:
            UserProfile.objects.create(user=user)
        except Exception:
            pass

        return user

class BookSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    published_date = serializers.DateField(required=False)

    class Meta:
        model = Book
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['user', 'bio']


class StaffCreateSerializer(serializers.Serializer):
    """Serializer for creating staff users. This is only used by authenticated
    staff/admins via a protected endpoint. Frontend must not be able to
    set roles on public registration endpoints."""
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value

    def validate(self, data):
        if data.get("password") != data.get("password2"):
            raise serializers.ValidationError({"password2": "Passwords do not match"})
        return data

    def create(self, validated_data):
        username = validated_data["username"]
        email = validated_data.get("email", "")
        password = validated_data["password"]

        user = User.objects.create_user(username=username, email=email, password=password)
        user.is_staff = True
        user.save()

        try:
            UserProfile.objects.create(user=user)
        except Exception:
            pass

        return user