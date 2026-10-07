from binascii import Error as BinasciiError
from decimal import Decimal

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db.models import Count, Sum, Q
from django.db.models.functions import Coalesce
from django.http import JsonResponse
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .emails import send_password_reset_email
from .models import CustomUser, Membership, Department

from .serializers import (
    CustomUserProfileSerializer,
    CustomUserRegistrationSerializer,
    CustomUserUpdateSerializer,
    ForgotPasswordSerializer,
    PasswordChangeSerializer,
    ResetPasswordSerializer,
    StaffCreateSerializer,
    MemberListSerializer,
    DepartmentSerializer,
)


# =========================================================================
# 🍪 JWT COOKIE UTILITIES
# =========================================================================


def set_refresh_cookie(response, refresh_token: str):
    response.set_cookie(
        key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
        value=refresh_token,
        max_age=settings.SIMPLE_JWT["AUTH_COOKIE_MAX_AGE"],
        httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
        secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
        samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
    )


def clear_refresh_cookie(response):
    response.delete_cookie(
        key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
        path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
        samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
    )


# =========================================================================
# 🔐 AUTHENTICATION & REGISTRATION VIEWS
# =========================================================================


class RegisterView(generics.CreateAPIView):
    """Public registration endpoint for students"""

    queryset = CustomUser.objects.all()
    serializer_class = CustomUserRegistrationSerializer
    permission_classes = [AllowAny]


class StaffCreateView(generics.CreateAPIView):
    """Protected endpoint to create staff users (admin only)"""

    queryset = CustomUser.objects.all()
    serializer_class = StaffCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Verify requester is admin/superuser
        if not self.request.user.is_staff and not self.request.user.is_superuser:
            raise PermissionDenied("Only staff can create staff accounts")
        serializer.save()


class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Interceptors login payloads containing 'user_id', normalizes it
    for SimpleJWT, and drops the refresh token into a highly secure cookie.
    """

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        refresh = response.data.pop("refresh", None)
        if refresh:
            set_refresh_cookie(response, refresh)
        return response


class CookieTokenRefreshView(TokenRefreshView):
    """Regenerates access keys reading straight out of the encrypted secure cookie."""

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"])
        if not refresh:
            return Response(
                {"detail": "Refresh cookie not found."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(data={"refresh": refresh})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as exc:
            raise InvalidToken(exc.args[0])

        data = serializer.validated_data
        response = Response(data, status=status.HTTP_200_OK)

        new_refresh = data.get("refresh")
        if new_refresh:
            set_refresh_cookie(response, new_refresh)
            response.data.pop("refresh", None)

        return response


class LogoutView(APIView):
    """Clears client browser authentication tokens securely."""

    permission_classes = [AllowAny]

    def post(self, request):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_refresh_cookie(response)
        return response


# =========================================================================
# 👤 USER PROFILE & MANAGEMENT VIEWS
# =========================================================================


class CurrentUserView(APIView):
    """Returns dynamic account context directly from the active session token."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        membership = Membership.objects.filter(user=user).first()

        data = {
            "id": user.id,
            "user_id": user.user_id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "is_active": user.is_active,
            "date_joined": user.date_joined,
            "role": user.role,
            "phone_number": user.phone_number,
            "department": user.department,
            "student_name": user.student_name,
            "membership_valid_till": (
                membership.valid_till.isoformat() if membership else None
            ),
            "avatar": user.user_id[:2].upper(),
        }
        return Response(data)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Reads or performs atomic updates directly onto the CustomUser row."""

    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return CustomUserUpdateSerializer
        return CustomUserProfileSerializer


class PasswordChangeView(APIView):
    """Verifies existing secret key structures before saving a new pass."""

    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Password updated successfully."}, status=status.HTTP_200_OK
        )

class MemberListView(generics.ListAPIView):
    """Returns a list of all registered users/members."""
    
    queryset = CustomUser.objects.all()
    serializer_class = MemberListSerializer
    permission_classes = [IsAuthenticated] 
    
    def get_queryset(self):
        return super().get_queryset().select_related('membership').annotate(
            currently_borrowed=Count('loans', filter=Q(loans__returned_at__isnull=True)),
            total_borrowed=Count('loans'),
            pending_fines=Coalesce(Sum('loans__fine__amount', filter=Q(loans__fine__status='pending')), Decimal('0.00'))
        )


class MemberDetailUpdateView(generics.RetrieveUpdateAPIView):
    """Allows staff or librarians to retrieve and update any member's details."""
    permission_classes = [IsAuthenticated]
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserUpdateSerializer

    def check_permissions(self, request):
        super().check_permissions(request)
        if request.user.role not in ['librarian', 'superadmin'] and not request.user.is_staff:
            raise PermissionDenied("Permission denied. Only staff or librarians can view or edit member details.")


class MemberToggleStatusView(APIView):
    """Toggle is_active status of a member (suspend or activate)."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in ['librarian', 'superadmin'] and not request.user.is_staff:
            return Response(
                {"detail": "Permission denied. Only staff or librarians can suspend members."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            target_user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({"detail": "Member not found."}, status=status.HTTP_404_NOT_FOUND)

        if target_user == request.user:
            return Response({"detail": "You cannot suspend your own account."}, status=status.HTTP_400_BAD_REQUEST)

        target_user.is_active = not target_user.is_active
        target_user.save(update_fields=['is_active'])

        action = "activated" if target_user.is_active else "suspended"
        return Response({
            "id": target_user.id,
            "is_active": target_user.is_active,
            "message": f"Member {target_user.user_id} has been {action} successfully."
        }, status=status.HTTP_200_OK)


class MemberHardDeleteView(APIView):
    """Permanently delete a member if they have zero loans, reservations, or fines."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role not in ['librarian', 'superadmin'] and not request.user.is_staff:
            return Response(
                {"detail": "Permission denied. Only staff or librarians can delete members."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            target_user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({"detail": "Member not found."}, status=status.HTTP_404_NOT_FOUND)

        if target_user == request.user:
            return Response({"detail": "You cannot delete your own account."}, status=status.HTTP_400_BAD_REQUEST)

        # Safety check: does the user have any loan history or reservations?
        if target_user.loans.exists():
            return Response(
                {"detail": "Cannot permanently delete: Member has circulation history in the system. Use Archival instead to preserve records."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if target_user.reservations.exists():
            return Response(
                {"detail": "Cannot permanently delete: Member has reservation history. Use Archival instead."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_display = target_user.user_id
        target_user.delete()

        return Response(
            {"message": f"Member {user_display} was permanently deleted successfully."},
            status=status.HTTP_200_OK
        )


class MemberArchiveView(APIView):
    """Toggles archival status of a member with Clearance checks."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in ['librarian', 'superadmin'] and not request.user.is_staff:
            return Response(
                {"detail": "Permission denied. Only staff or librarians can archive members."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            target_user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({"detail": "Member not found."}, status=status.HTTP_404_NOT_FOUND)

        if target_user == request.user:
            return Response({"detail": "You cannot archive your own account."}, status=status.HTTP_400_BAD_REQUEST)

        # If already archived, allow un-archiving / restoration
        if target_user.is_archived:
            target_user.is_archived = False
            target_user.is_active = True
            target_user.archived_at = None
            target_user.archive_reason = None
            target_user.save(update_fields=['is_archived', 'is_active', 'archived_at', 'archive_reason'])
            return Response({
                "id": target_user.id,
                "is_archived": False,
                "message": f"Member {target_user.user_id} has been restored from archive."
            }, status=status.HTTP_200_OK)

        # Clearance Check 1: Unreturned books
        has_active_loans = target_user.loans.filter(returned_at__isnull=True).exists()
        if has_active_loans:
            return Response(
                {"detail": f"Cannot archive: Member {target_user.user_id} currently holds unreturned borrowed books."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Clearance Check 2: Unpaid pending fines
        has_pending_fines = target_user.loans.filter(fine__status='pending').exists()
        if has_pending_fines:
            return Response(
                {"detail": f"Cannot archive: Member {target_user.user_id} has unpaid pending fines."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Clear active reservations so books can be allocated to other waiting members
        target_user.reservations.filter(status__in=['pending', 'ready']).update(status='cancelled')

        reason = request.data.get('reason', 'Graduated / Left Institution')
        target_user.is_archived = True
        target_user.is_active = False
        target_user.archived_at = timezone.now()
        target_user.archive_reason = reason
        target_user.save(update_fields=['is_archived', 'is_active', 'archived_at', 'archive_reason'])

        return Response({
            "id": target_user.id,
            "is_archived": True,
            "message": f"Member {target_user.user_id} has been archived successfully."
        }, status=status.HTTP_200_OK)


class BatchArchiveView(APIView):
    """Bulk archives students in a specific batch with Clearance verification."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role not in ['librarian', 'superadmin'] and not request.user.is_staff:
            return Response(
                {"detail": "Permission denied. Only staff or librarians can perform batch archival."},
                status=status.HTTP_403_FORBIDDEN
            )

        batch = request.data.get('batch')
        reason = request.data.get('reason', f"Batch {batch} Graduation")
        if not batch:
            return Response({"detail": "Batch parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        students = CustomUser.objects.filter(role='student', batch=batch, is_archived=False)
        total_students = students.count()

        if total_students == 0:
            return Response(
                {"detail": f"No active/unarchived students found in batch '{batch}'."},
                status=status.HTTP_404_NOT_FOUND
            )

        from apps.circulation.models import Loan, Reservation
        from apps.billing.models import Fine

        # Find defaulter IDs directly from actual unreturned loans and pending fines
        unreturned_borrower_ids = set(
            Loan.objects.filter(borrower__in=students, returned_at__isnull=True).values_list('borrower_id', flat=True)
        )
        unpaid_fine_borrower_ids = set(
            Fine.objects.filter(loan__borrower__in=students, status='pending').values_list('loan__borrower_id', flat=True)
        )
        defaulter_ids = unreturned_borrower_ids.union(unpaid_fine_borrower_ids)
        defaulter_users = students.filter(id__in=defaulter_ids)

        # Prepare detailed defaulters info for the frontend report
        defaulters_list = []
        for d in defaulter_users:
            unreturned_count = d.loans.filter(returned_at__isnull=True).count()
            unpaid_fines_sum = d.loans.filter(fine__status='pending').aggregate(total=Sum('fine__amount'))['total'] or Decimal('0.00')
            defaulters_list.append({
                "id": d.id,
                "user_id": d.user_id,
                "name": d.student_name or f"{d.first_name} {d.last_name}".strip() or d.user_id,
                "department": d.department or "N/A",
                "unreturned_books": unreturned_count,
                "pending_fines": str(unpaid_fines_sum)
            })

        # Bulk archive cleared students
        cleared_students_qs = students.exclude(id__in=defaulter_ids)
        cleared_ids = list(cleared_students_qs.values_list('id', flat=True))

        cleared_count = cleared_students_qs.update(
            is_archived=True,
            is_active=False,
            archived_at=timezone.now(),
            archive_reason=reason
        )

        # Cancel pending reservations for all newly archived students
        Reservation.objects.filter(user_id__in=cleared_ids, status__in=['pending', 'ready']).update(status='cancelled')

        return Response({
            "batch": batch,
            "total_processed": total_students,
            "archived_count": cleared_count,
            "defaulters_count": len(defaulters_list),
            "defaulters": defaulters_list,
            "message": f"Archived {cleared_count} students from batch {batch}. {len(defaulters_list)} students were skipped due to outstanding dues."
        }, status=status.HTTP_200_OK)


class MemberBulkActionView(APIView):
    """
    Performs bulk administrative operations on multiple selected members:
    - 'suspend': Deactivates accounts
    - 'activate': Activates accounts
    - 'archive': Archives accounts (with clearance verification)
    - 'restore': Restores accounts from archive
    - 'delete': Permanently deletes members without circulation history
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role not in ['librarian', 'superadmin'] and not request.user.is_staff:
            return Response(
                {"detail": "Permission denied. Only staff or librarians can perform bulk actions."},
                status=status.HTTP_403_FORBIDDEN
            )

        member_ids = request.data.get("member_ids", [])
        action = request.data.get("action")
        reason = request.data.get("reason", "Bulk administrative action")

        if not member_ids or not isinstance(member_ids, list):
            return Response({"detail": "member_ids must be a non-empty list of IDs."}, status=status.HTTP_400_BAD_REQUEST)

        if not action:
            return Response({"detail": "action parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        target_users = CustomUser.objects.filter(id__in=member_ids).exclude(id=request.user.id)
        if not target_users.exists():
            return Response({"detail": "No valid members found to process."}, status=status.HTTP_404_NOT_FOUND)

        total_requested = len(member_ids)

        if action == "suspend":
            count = target_users.update(is_active=False)
            return Response({
                "action": "suspend",
                "message": f"{count} member(s) suspended successfully.",
                "total_requested": total_requested,
                "success_count": count,
                "skipped_count": 0,
                "skipped_members": []
            }, status=status.HTTP_200_OK)

        elif action == "activate":
            count = target_users.update(is_active=True)
            return Response({
                "action": "activate",
                "message": f"{count} member(s) activated successfully.",
                "total_requested": total_requested,
                "success_count": count,
                "skipped_count": 0,
                "skipped_members": []
            }, status=status.HTTP_200_OK)

        elif action == "restore":
            to_restore = target_users.filter(is_archived=True)
            already_active = target_users.filter(is_archived=False)
            count = to_restore.update(
                is_archived=False,
                is_active=True,
                archived_at=None,
                archive_reason=None
            )
            skipped_list = []
            for u in already_active:
                skipped_list.append({
                    "id": u.id,
                    "user_id": u.user_id,
                    "name": u.student_name or f"{u.first_name} {u.last_name}".strip() or u.user_id,
                    "department": u.department or "N/A",
                    "reason": "Already active (not archived)"
                })
            return Response({
                "action": "restore",
                "message": f"{count} member(s) restored from archive.",
                "total_requested": total_requested,
                "success_count": count,
                "skipped_count": len(skipped_list),
                "skipped_members": skipped_list
            }, status=status.HTTP_200_OK)

        elif action == "archive":
            from apps.circulation.models import Loan, Reservation
            from apps.billing.models import Fine

            unreturned_borrower_ids = set(
                Loan.objects.filter(borrower__in=target_users, returned_at__isnull=True).values_list('borrower_id', flat=True)
            )
            unpaid_fine_borrower_ids = set(
                Fine.objects.filter(loan__borrower__in=target_users, status='pending').values_list('loan__borrower_id', flat=True)
            )
            defaulter_ids = unreturned_borrower_ids.union(unpaid_fine_borrower_ids)
            defaulter_users = target_users.filter(id__in=defaulter_ids)

            skipped_list = []
            for d in defaulter_users:
                unreturned_count = d.loans.filter(returned_at__isnull=True).count()
                unpaid_fines_sum = d.loans.filter(fine__status='pending').aggregate(total=Sum('fine__amount'))['total'] or Decimal('0.00')
                reasons = []
                if unreturned_count > 0:
                    reasons.append(f"{unreturned_count} unreturned book(s)")
                if unpaid_fines_sum > 0:
                    reasons.append(f"₹{unpaid_fines_sum} pending fine")
                skipped_list.append({
                    "id": d.id,
                    "user_id": d.user_id,
                    "name": d.student_name or f"{d.first_name} {d.last_name}".strip() or d.user_id,
                    "department": d.department or "N/A",
                    "unreturned_books": unreturned_count,
                    "pending_fines": str(unpaid_fines_sum),
                    "reason": " & ".join(reasons) or "Outstanding circulation dues"
                })

            cleared_users = target_users.exclude(id__in=defaulter_ids)
            cleared_ids = list(cleared_users.values_list('id', flat=True))

            cleared_count = cleared_users.update(
                is_archived=True,
                is_active=False,
                archived_at=timezone.now(),
                archive_reason=reason
            )

            Reservation.objects.filter(user_id__in=cleared_ids, status__in=['pending', 'ready']).update(status='cancelled')

            msg = f"{cleared_count} member(s) archived successfully."
            if skipped_list:
                msg += f" {len(skipped_list)} member(s) were skipped due to outstanding dues."

            return Response({
                "action": "archive",
                "message": msg,
                "total_requested": total_requested,
                "success_count": cleared_count,
                "archived_count": cleared_count,
                "skipped_count": len(skipped_list),
                "skipped_members": skipped_list
            }, status=status.HTTP_200_OK)

        elif action == "delete":
            from apps.circulation.models import Loan, Reservation
            users_with_loans = set(Loan.objects.filter(borrower__in=target_users).values_list('borrower_id', flat=True))
            users_with_reservations = set(Reservation.objects.filter(user__in=target_users).values_list('user_id', flat=True))
            ineligible_ids = users_with_loans.union(users_with_reservations)

            ineligible_users = target_users.filter(id__in=ineligible_ids)
            skipped_list = []
            for u in ineligible_users:
                has_loans = u.id in users_with_loans
                has_res = u.id in users_with_reservations
                reasons = []
                if has_loans:
                    reasons.append("Loan circulation history exists")
                if has_res:
                    reasons.append("Active reservation exists")
                reason_str = ", ".join(reasons) + " (Archival recommended)"
                skipped_list.append({
                    "id": u.id,
                    "user_id": u.user_id,
                    "name": u.student_name or f"{u.first_name} {u.last_name}".strip() or u.user_id,
                    "department": u.department or "N/A",
                    "reason": reason_str,
                    "suggestArchive": True
                })

            deletable_users = target_users.exclude(id__in=ineligible_ids)
            delete_count = deletable_users.count()
            deletable_users.delete()

            msg = f"{delete_count} member(s) deleted permanently."
            if skipped_list:
                msg += f" {len(skipped_list)} member(s) could not be deleted because circulation records exist."

            return Response({
                "action": "delete",
                "message": msg,
                "total_requested": total_requested,
                "success_count": delete_count,
                "deleted_count": delete_count,
                "skipped_count": len(skipped_list),
                "skipped_members": skipped_list
            }, status=status.HTTP_200_OK)

        else:
            return Response({"detail": f"Unknown action '{action}'."}, status=status.HTTP_400_BAD_REQUEST)

# =========================================================================
# 📊 METRICS & DASHBOARD DATA VIEWS
# =========================================================================


class DashboardView(APIView):
    """Compiles loans, active holdings, and pending liabilities directly via User ID."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.billing.models import Fine
        from apps.circulation.models import Loan
        from apps.catalog.models import Wishlist
        from django.utils import timezone
        from datetime import timedelta

        user = request.user
        membership = Membership.objects.filter(user=user).first()

        currently_borrowed = Loan.objects.filter(
            borrower=user, returned_at__isnull=True
        ).count()

        total_borrowed = Loan.objects.filter(borrower=user).count()

        pending_fines = (
            Fine.objects.filter(loan__borrower=user, status="pending").aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        now = timezone.now()
        due_soon = Loan.objects.filter(
            borrower=user,
            returned_at__isnull=True,
            due_at__gte=now,
            due_at__lte=now + timedelta(days=7)
        ).count()

        wishlist = Wishlist.objects.filter(user=user).count()

        data = {
            "account_information": {
                "id": user.id,
                "user_id": user.user_id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone_number": user.phone_number,
            },
            "academic_details": {
                "department": user.department,
                "batch": user.batch,
                "student_name": user.student_name,
                "father_name": user.father_name,
                "mother_name": user.mother_name,
            },
            "library_information": {
                "currently_borrowed": currently_borrowed,
                "total_borrowed": total_borrowed,
                "pending_fines": float(pending_fines),
                "due_soon": due_soon,
                "wishlist": wishlist,
                "membership_valid_till": (
                    membership.valid_till.isoformat() if membership else None
                ),
            },
        }
        return Response(data)


# =========================================================================
# 🔑 SECURITY & RECOVERY VIEWS
# =========================================================================


@method_decorator(csrf_exempt, name="dispatch")
class ForgotPasswordView(APIView):
    """Generates encrypted system tokens targeted to a confirmed CustomUser account email."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        user = CustomUser.objects.filter(email=email).first()

        # If user exists, create token and send reset email
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            frontend_url = getattr(
                settings, "FRONTEND_URL", "http://localhost:5173"
            ).rstrip("/")
            reset_link = f"{frontend_url}/reset-password?uid={uid}&token={token}"

            try:
                user_display = user.get_full_name() or user.user_id
                send_password_reset_email(user.email, user_display, reset_link)
            except Exception as e:
                return Response(
                    {"detail": f"Error sending email: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )


        return JsonResponse(
            {
                "detail": "If an account exists for that email, instructions have been sent."
            },
            status=200,
        )


@method_decorator(csrf_exempt, name="dispatch")
class VerifyResetTokenView(APIView):
    """Verifies whether a password reset token and uid are valid and active."""

    permission_classes = [AllowAny]

    def get(self, request):
        uid = request.query_params.get("uid")
        token = request.query_params.get("token")

        if not uid or not token:
            return JsonResponse(
                {"valid": False, "detail": "Missing uid or token parameter."},
                status=400,
            )

        try:
            target_pk = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=target_pk)
        except (
            BinasciiError,
            TypeError,
            ValueError,
            OverflowError,
            UnicodeDecodeError,
            CustomUser.DoesNotExist,
        ):
            return JsonResponse(
                {"valid": False, "detail": "Invalid reset link."}, status=400
            )

        if not default_token_generator.check_token(user, token):
            return JsonResponse(
                {"valid": False, "detail": "Invalid or expired token."},
                status=400,
            )

        return JsonResponse(
            {"valid": True, "detail": "Token is valid."}, status=200
        )


@method_decorator(csrf_exempt, name="dispatch")
class ResetPasswordView(APIView):
    """Decrypts incoming access strings to change a user's password securely."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data["user_id"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            target_pk = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=target_pk)
        except (
            BinasciiError,
            TypeError,
            ValueError,
            OverflowError,
            UnicodeDecodeError,
            CustomUser.DoesNotExist,
        ):
            return JsonResponse({"detail": "Invalid reset link."}, status=400)

        if not default_token_generator.check_token(user, token):
            return JsonResponse({"detail": "Invalid or expired token."}, status=400)

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return JsonResponse(
            {"detail": "Password has been reset successfully."}, status=200
        )



class DepartmentListCreateView(generics.ListCreateAPIView):
    """List and create departments / branches"""

    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]

