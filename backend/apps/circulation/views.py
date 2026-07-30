from datetime import timedelta

from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from common.permissions.base import IsStaffOrReadOnly
from apps.billing.models import Fine
from apps.inventory.models import BookCopy
from apps.notifications.utils import create_student_notification

from .models import Loan, Reservation
from .serializers import LoanSerializer, ReservationSerializer


class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.select_related("copy", "borrower").all()
    serializer_class = LoanSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Allow filtering by user_id
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(borrower_id=user_id)
            
        if self.request.user.is_authenticated and (self.request.user.is_staff or getattr(self.request.user, 'is_librarian_staff', False)):
            return queryset
        return queryset.filter(borrower=self.request.user)

    def perform_create(self, serializer):
        copy = serializer.validated_data["copy"]
        if copy.status != BookCopy.AVAILABLE:
            raise ValidationError({"copy": "This copy is not available."})

        loan = serializer.save()
        copy.status = BookCopy.LOANED
        copy.save(update_fields=["status"])
        
        create_student_notification(
            user=loan.borrower,
            notif_type="book_issued",
            title="Book Issued",
            message=f"You have successfully borrowed '{copy.book.title}'. It is due on {loan.due_at.strftime('%Y-%m-%d')}."
        )
        return loan

    def perform_update(self, serializer):
        loan = serializer.save()

        if loan.returned_at and loan.copy.status != BookCopy.AVAILABLE:
            loan.copy.status = BookCopy.AVAILABLE
            loan.copy.save(update_fields=["status"])
            
            create_student_notification(
                user=loan.borrower,
                notif_type="book_returned",
                title="Book Returned",
                message=f"You have successfully returned '{loan.copy.book.title}'."
            )

            if loan.returned_at.date() > loan.due_at.date() and not hasattr(loan, "fine"):
                overdue_days = max((loan.returned_at.date() - loan.due_at.date()).days, 1)
                fine = Fine.objects.create(
                    loan=loan,
                    amount=overdue_days * 10,
                    reason="Overdue return",
                )
                
                create_student_notification(
                    user=loan.borrower,
                    notif_type="fine_created",
                    title="Fine Generated",
                    message=f"An overdue fine of ₹{fine.amount} has been added to your account for returning '{loan.copy.book.title}' late."
                )

    @action(detail=True, methods=["get"])
    def calculate_fine(self, request, pk=None):
        loan = self.get_object()
        if loan.returned_at:
            return Response({"detail": "Loan already closed.", "fine_amount": 0}, status=status.HTTP_400_BAD_REQUEST)
        
        now = timezone.now()
        if now.date() > loan.due_at.date():
            overdue_days = max((now.date() - loan.due_at.date()).days, 1)
            fine_amount = overdue_days * 10
            return Response({"overdue": True, "overdue_days": overdue_days, "fine_amount": fine_amount}, status=status.HTTP_200_OK)
        return Response({"overdue": False, "overdue_days": 0, "fine_amount": 0}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def return_loan(self, request, pk=None):
        loan = self.get_object()
        if loan.returned_at:
            return Response({"detail": "This loan is already closed."}, status=status.HTTP_400_BAD_REQUEST)

        loan.returned_at = timezone.now()
        loan.save(update_fields=["returned_at"])

        loan.copy.status = BookCopy.AVAILABLE
        loan.copy.save(update_fields=["status"])
        
        create_student_notification(
            user=loan.borrower,
            notif_type="book_returned",
            title="Book Returned",
            message=f"You have successfully returned '{loan.copy.book.title}'."
        )

        if loan.returned_at.date() > loan.due_at.date() and not hasattr(loan, "fine"):
            overdue_days = max((loan.returned_at.date() - loan.due_at.date()).days, 1)
            
            # Use lower() to handle string conversions from frontend if needed, but bool is safer
            # request.data can contain boolean True/False
            paid_now = request.data.get("paid_now", False)
            fine_status = Fine.PAID if paid_now in [True, 'true', 'True', 1] else Fine.PENDING
            
            fine = Fine.objects.create(
                loan=loan,
                amount=overdue_days * 10,
                reason="Overdue return",
                status=fine_status
            )
            
            create_student_notification(
                user=loan.borrower,
                notif_type="fine_created",
                title="Fine Generated",
                message=f"An overdue fine of ₹{fine.amount} has been added to your account for returning '{loan.copy.book.title}' late."
            )
            
            msg = "Book returned. Fine marked as paid." if fine_status == Fine.PAID else "Book returned. Fine added to account."
            return Response(
                {"detail": msg, "fine_id": fine.id, "fine_status": fine_status},
                status=status.HTTP_200_OK,
            )

        return Response({"detail": "Book returned successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def renew(self, request, pk=None):
        loan = self.get_object()
        
        # Rule 0: Must own the loan or be staff
        if not (request.user.is_staff or getattr(request.user, 'is_librarian_staff', False) or request.user == loan.borrower):
            return Response({"detail": "You can only renew your own books."}, status=status.HTTP_403_FORBIDDEN)

        # Rule 1: Cannot renew if returned or overdue
        if loan.returned_at:
            raise ValidationError({"detail": "Returned loans cannot be renewed."})
            
        if timezone.now().date() > loan.due_at.date():
            raise ValidationError({"detail": "Overdue loans cannot be renewed. Please return the book and clear your fines."})

        # Rule 2: Max 2 renewals
        if loan.renewed_count >= 2:
            raise ValidationError({"detail": "Maximum renewal limit (2 times) reached for this book."})

        # Rule 3: Check for unpaid fines
        has_unpaid_fines = Fine.objects.filter(loan__borrower=request.user, status=Fine.PENDING).exists()
        if has_unpaid_fines:
            raise ValidationError({"detail": "Cannot renew. You have unpaid fines on your account."})

        # Rule 4: Check if another user has reserved this book
        has_reservations = Reservation.objects.filter(book=loan.copy.book, status=Reservation.PENDING).exists()
        if has_reservations:
            raise ValidationError({"detail": "Cannot renew. Another student is waiting for this book."})

        loan.renewed_count += 1
        loan.due_at = loan.due_at + timedelta(days=14)
        loan.save(update_fields=["renewed_count", "due_at"])
        return Response({"detail": "Loan renewed successfully.", "due_at": loan.due_at})


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.select_related("book", "user").all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated and (self.request.user.is_staff or self.request.user.is_librarian_staff):
            return queryset
        return queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # Remember the old status before saving
        old_status = serializer.instance.status
        instance = serializer.save()
        # 1. Handling Approval (Pending -> Ready)
        if instance.status == Reservation.READY and old_status != Reservation.READY:
            # Set the timestamp
            if not instance.ready_at:
                instance.ready_at = timezone.now()
                instance.save(update_fields=['ready_at'])
            
            # Lock a physical copy!
            if not instance.allocated_copy:
                available_copy = BookCopy.objects.filter(book=instance.book, status=BookCopy.AVAILABLE).first()
                
                if not available_copy:
                    raise ValidationError({"detail": "No available copies to lock for this reservation."})
                
                # Link the specific copy to this reservation
                instance.allocated_copy = available_copy
                instance.save(update_fields=['allocated_copy'])
                
            # Verify the locked copy is actually available if it was manually provided
            if instance.allocated_copy.status != BookCopy.AVAILABLE:
                raise ValidationError({"detail": "The selected copy is not available."})

            # Change the physical copy's status to prevent theft
            instance.allocated_copy.status = BookCopy.RESERVED
            instance.allocated_copy.save(update_fields=['status'])
            
            create_student_notification(
                user=instance.user,
                notif_type="reservation_ready",
                title="Reservation Ready!",
                message=f"Good news! Your reserved book '{instance.book.title}' is now available. Please pick it up from the library."
            )
        # 2. Handling Cancellation/Denial
        elif instance.status == Reservation.CANCELLED and old_status != Reservation.CANCELLED:
            if not instance.cancelled_at:
                instance.cancelled_at = timezone.now()
                instance.save(update_fields=['cancelled_at'])

            if instance.allocated_copy:
                # Release the locked copy back to the library
                released_copy = instance.allocated_copy
                released_copy.status = BookCopy.AVAILABLE
                released_copy.save(update_fields=['status'])
                
                # Unlink it from the reservation
                instance.allocated_copy = None
                instance.save(update_fields=['allocated_copy'])
            
            create_student_notification(
                user=instance.user,
                notif_type="reservation_cancelled",
                title="Reservation Cancelled",
                message=f"Your reservation for '{instance.book.title}' has been cancelled by the library."
            )

    @action(detail=True, methods=["post"])
    def fulfill(self, request, pk=None):
        """Marks reservation as fulfilled and creates an active loan simultaneously."""
        reservation = self.get_object()

        if reservation.status != Reservation.READY:
            return Response({"error": "Only READY reservations can be fulfilled."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Get the copy we pre-locked for them during Approval
        locked_copy = reservation.allocated_copy
        
        # (Fallback just in case it's an old reservation from before we added this feature)
        if not locked_copy:
            locked_copy = BookCopy.objects.filter(book=reservation.book, status=BookCopy.AVAILABLE).first()
            if not locked_copy:
                return Response({"error": "No copies available to issue."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Create the loan using the specific locked copy
        due_date = timezone.now() + timezone.timedelta(days=14)
        Loan.objects.create(
            copy=locked_copy,
            borrower=reservation.user,
            due_at=due_date
        )

        # 3. Update copy status to LOANED
        locked_copy.status = BookCopy.LOANED
        locked_copy.save(update_fields=['status'])
        
        # 4. Mark reservation as fulfilled
        reservation.status = Reservation.FULFILLED
        reservation.save(update_fields=['status'])
        
        create_student_notification(
            user=reservation.user,
            notif_type="book_issued",
            title="Book Issued",
            message=f"You have successfully borrowed '{locked_copy.book.title}'. It is due on {due_date.strftime('%Y-%m-%d')}."
        )
        
        return Response({"detail": "Book issued and reservation fulfilled!"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def extend_pickup(self, request, pk=None):
        """Allows a user to extend the pickup deadline by 24 hours (once)."""
        reservation = self.get_object()
        
        if reservation.status != Reservation.READY:
            return Response({"error": "Only READY reservations can be extended."}, status=status.HTTP_400_BAD_REQUEST)
            
        if reservation.is_extended:
            return Response({"error": "This reservation has already been extended once."}, status=status.HTTP_400_BAD_REQUEST)
            
        reservation.is_extended = True
        reservation.save(update_fields=["is_extended"])
        
        # We can send a notification as well
        create_student_notification(
            user=reservation.user,
            notif_type="reservation_extended",
            title="Reservation Extended",
            message=f"Your pickup deadline for '{reservation.book.title}' has been extended by 24 hours."
        )
        
        return Response({"detail": "Pickup deadline extended successfully."}, status=status.HTTP_200_OK)