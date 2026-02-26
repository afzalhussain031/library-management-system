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
    invite_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

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
        invite_code = validated_data.get("invite_code", "")

        is_staff = False
        # Check invite code from settings (store a secret in env vars in production)
        STAFF_INVITE = getattr(settings, "STAFF_INVITE_CODE", "")
        if invite_code and STAFF_INVITE and invite_code == STAFF_INVITE:
            is_staff = True

        user = User.objects.create_user(username=username, email=email, password=password)
        user.is_staff = is_staff
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