from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

CustomUser = get_user_model()


class CustomUserAuthBackend(ModelBackend):
    """
    Authenticate using user_id instead of username.
    user_id can be Enrollment Number or Employee ID.
    """

    def authenticate(self, request, user_id=None, password=None, **kwargs):
        """
        user_id parameter contains Enrollment Number or Employee ID.
        We also check kwargs for 'username' because Django's Admin panel
        stubbornly passes the credentials using that keyword!
        """
        # --- THE FIX: Catch the admin panel data ---
        if user_id is None:
            user_id = kwargs.get("username")
        # -------------------------------------------

        if not user_id or not password:
            return None

        try:
            # Query using user_id instead of username
            user = CustomUser.objects.get(user_id=user_id)

            # Check password
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        except CustomUser.DoesNotExist:
            # Hash the password anyway (prevents timing attacks)
            CustomUser().set_password(password)
            return None

        return None

    def get_user(self, user_id):
        try:
            return CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return None
