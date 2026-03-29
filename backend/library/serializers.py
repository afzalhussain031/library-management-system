from rest_framework import serializers
from .models import Book, UserProfile
from django.contrib.auth.models import User
from .models import UserProfile
from django.conf import settings

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
        username = validated_data["username"]
        email = validated_data.get("email", "")
        password = validated_data["password"]

        user = User.objects.create_user(username=username, email=email, password=password)
        user.is_staff = self.is_staff_user
        user.save()

        # create profile if your model expects it
        try:
            UserProfile.objects.create(user=user)
        except Exception:
            pass

        return user


class RegisterSerializer(BaseUserRegistrationSerializer):
    """Public registration always creates non-staff users."""
    is_staff_user = False

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


class StaffCreateSerializer(BaseUserRegistrationSerializer):
    """Serializer for creating staff users. This is only used by authenticated
    staff/admins via a protected endpoint. Frontend must not be able to
    set roles on public registration endpoints."""
    is_staff_user = True