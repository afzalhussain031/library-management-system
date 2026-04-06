from rest_framework import serializers
from .models import Book, UserProfile
from django.contrib.auth.models import User

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
    id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)
    email = serializers.EmailField(source='user.email', required=False, allow_blank=True)
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'is_staff', 'date_joined', 'email', 'first_name', 'last_name', 'bio']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})

        user_changed_fields = []
        for field in ('email', 'first_name', 'last_name'):
            if field in user_data:
                setattr(instance.user, field, user_data[field])
                user_changed_fields.append(field)

        if user_changed_fields:
            instance.user.save(update_fields=user_changed_fields)

        if 'bio' in validated_data:
            instance.bio = validated_data['bio']
            instance.save(update_fields=['bio'])

        return instance

class StaffCreateSerializer(BaseUserRegistrationSerializer):
    """Serializer for creating staff users. This is only used by authenticated
    staff/admins via a protected endpoint. Frontend must not be able to
    set roles on public registration endpoints."""
    is_staff_user = True