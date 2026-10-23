from datetime import datetime, time, timedelta

from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from common.permissions.base import IsStaffOrReadOnly
from apps.billing.models import Fine
from apps.inventory.models import BookCopy
from apps.notifications.utils import create_student_notification

from .models import Loan, Reservation
from .serializers import LoanSerializer, ReservationSerializer


class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.select_related(
        "copy__book__publisher",
        "copy__book__category",
        "borrower"
    ).all()
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
        borrower = serializer.validated_data.get("borrower")
        if borrower and not borrower.is_active:
            raise ValidationError({"borrower": "This member's account is currently suspended and cannot borrow books."})

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
            message=f"You have successfully borrowed '{copy.book.title}'. It is due on {loan.due_at.strftime('%Y-%m-%d')}.",
            related_entity_id=loan.id
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
                message=f"You have successfully returned '{loan.copy.book.title}'.",
                related_entity_id=loan.id
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
                    message=f"An overdue fine of ₹{fine.amount} has been added to your account for returning '{loan.copy.book.title}' late.",
                    related_entity_id=fine.id
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
            message=f"You have successfully returned '{loan.copy.book.title}'.",
            related_entity_id=loan.id
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
                message=f"An overdue fine of ₹{fine.amount} has been added to your account for returning '{loan.copy.book.title}' late.",
                related_entity_id=fine.id
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

        # Rule 0.5: Cannot renew if borrower is suspended
        if not loan.borrower.is_active:
            raise ValidationError({"detail": "Cannot renew loan. This account is currently suspended."})

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

    @action(detail=True, methods=["post"])
    def adjust_due_date(self, request, pk=None):
        if not (request.user.is_staff or getattr(request.user, 'role', '') in ['staff', 'librarian', 'superadmin']):
            return Response({"detail": "Only library staff can adjust due dates."}, status=status.HTTP_403_FORBIDDEN)

        loan = self.get_object()
        if loan.returned_at:
            raise ValidationError({"detail": "Cannot adjust due date for an already returned book."})

        new_due_at = request.data.get("due_at")
        reason = (request.data.get("reason") or "").strip()

        if not new_due_at:
            raise ValidationError({"due_at": "New due date is required."})

        try:
            date_str = str(new_due_at).strip().replace("Z", "")
            if len(date_str) == 10:
                d = datetime.strptime(date_str, "%Y-%m-%d").date()
                parsed_date = timezone.make_aware(datetime.combine(d, time(23, 59, 59)))
            else:
                parsed_date = timezone.datetime.fromisoformat(date_str)
                if timezone.is_naive(parsed_date):
                    parsed_date = timezone.make_aware(parsed_date)
        except (ValueError, TypeError):
            raise ValidationError({"due_at": "Invalid date format. Expected YYYY-MM-DD."})

        if parsed_date.date() < loan.issued_at.date():
            raise ValidationError({"due_at": "Due date cannot be earlier than the issue date."})

        old_due_formatted = loan.due_at.strftime('%d-%b-%Y')
        new_due_formatted = parsed_date.strftime('%d-%b-%Y')

        admin_name = request.user.get_full_name() or request.user.user_id
        timestamp = timezone.now().strftime('%Y-%m-%d %H:%M')
        audit_note = f"[{timestamp}] Due date changed from {old_due_formatted} to {new_due_formatted} by {admin_name}."
        if reason:
            audit_note += f" Reason: {reason}"

        loan.due_at = parsed_date
        loan.notes = f"{loan.notes}\n{audit_note}".strip() if loan.notes else audit_note
        loan.save(update_fields=["due_at", "notes"])

        create_student_notification(
            user=loan.borrower,
            notif_type="book_issued",
            title="Due Date Extended",
            message=f"The due date for '{loan.copy.book.title}' has been adjusted to {new_due_formatted}.",
            related_entity_id=loan.id
        )

        serializer = self.get_serializer(loan)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], permission_classes=[IsStaffOrReadOnly])
    @transaction.atomic
    def bulk_issue(self, request):
        borrower_id = request.data.get("borrower")
        items = request.data.get("items", [])

        if not borrower_id:
            raise ValidationError({"borrower": "Borrower ID is required."})
        if not items or not isinstance(items, list):
            raise ValidationError({"items": "At least one book copy must be selected to issue."})

        User = get_user_model()
        borrower = get_object_or_404(User, id=borrower_id)
        if not borrower.is_active:
            raise ValidationError({"borrower": "This member's account is currently suspended and cannot borrow books."})

        # Member quota validation
        active_loans_count = Loan.objects.filter(borrower=borrower, returned_at__isnull=True).count()
        role_limit = 10 if getattr(borrower, "role", "") in ["staff", "librarian", "superadmin"] else 5
        if active_loans_count + len(items) > role_limit:
            raise ValidationError({
                "detail": f"Borrowing limit exceeded. Member already has {active_loans_count} active loan(s). Limit is {role_limit} books."
            })

        copy_ids = [item.get("copy_id") for item in items if item.get("copy_id")]
        if len(copy_ids) != len(items):
            raise ValidationError({"items": "Each item must specify a valid copy_id."})

        if len(copy_ids) != len(set(copy_ids)):
            raise ValidationError({"items": "Duplicate book copies found in the issue list."})

        copies = BookCopy.objects.select_for_update().filter(id__in=copy_ids).select_related("book")
        if copies.count() != len(copy_ids):
            raise ValidationError({"detail": "One or more selected book copies do not exist."})

        for copy in copies:
            if copy.status != BookCopy.AVAILABLE:
                raise ValidationError({"detail": f"Copy '{copy.accession_number}' of '{copy.book.title}' is currently not available ({copy.status})."})

        now = timezone.now()
        new_loans = []
        copies_dict = {c.id: c for c in copies}

        for item in items:
            copy = copies_dict[item["copy_id"]]
            raw_due_date = item.get("due_at")
            if raw_due_date:
                try:
                    date_str = str(raw_due_date).strip().replace("Z", "")
                    if len(date_str) == 10:
                        d = datetime.strptime(date_str, "%Y-%m-%d").date()
                        parsed_due = timezone.make_aware(datetime.combine(d, time(23, 59, 59)))
                    else:
                        parsed_due = timezone.datetime.fromisoformat(date_str)
                        if timezone.is_naive(parsed_due):
                            parsed_due = timezone.make_aware(parsed_due)
                except Exception:
                    parsed_due = now + timedelta(days=14)
            else:
                parsed_due = now + timedelta(days=14)

            new_loans.append(Loan(
                copy=copy,
                borrower=borrower,
                due_at=parsed_due,
                notes=item.get("notes", "")
            ))

        created_loans = Loan.objects.bulk_create(new_loans)
        BookCopy.objects.filter(id__in=copy_ids).update(status=BookCopy.LOANED)

        book_titles = [f"'{c.book.title}'" for c in copies]
        if len(book_titles) == 1:
            title_text = book_titles[0]
        elif len(book_titles) == 2:
            title_text = f"{book_titles[0]} and {book_titles[1]}"
        else:
            title_text = f"{', '.join(book_titles[:-1])}, and {book_titles[-1]}"

        create_student_notification(
            user=borrower,
            notif_type="book_issued",
            title="Books Issued",
            message=f"You have successfully borrowed {len(copies)} book(s): {title_text}.",
            related_entity_id=created_loans[0].id if created_loans else None
        )

        return Response({
            "detail": f"Successfully issued {len(copies)} book(s).",
            "issued_count": len(copies)
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], permission_classes=[IsStaffOrReadOnly])
    @transaction.atomic
    def bulk_return(self, request):
        loan_ids = request.data.get("loan_ids", [])
        paid_now = request.data.get("paid_now", False)
        payment_method = request.data.get("payment_method", "cash")

        if not loan_ids or not isinstance(loan_ids, list):
            raise ValidationError({"loan_ids": "At least one loan must be selected for return."})

        loans = Loan.objects.select_for_update().filter(
            id__in=loan_ids,
            returned_at__isnull=True
        ).select_related("copy__book", "borrower")

        if not loans.exists():
            return Response({"detail": "No active loans found matching selection (they may have already been returned)."}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        fines_to_create = []
        copy_ids = []
        returned_count = 0
        borrower = loans[0].borrower
        total_fine_amount = 0

        is_paid = paid_now in [True, 'true', 'True', 1]
        fine_status = Fine.PAID if is_paid else Fine.PENDING

        for loan in loans:
            loan.returned_at = now
            loan.save(update_fields=["returned_at"])
            copy_ids.append(loan.copy_id)
            returned_count += 1

            if loan.returned_at.date() > loan.due_at.date() and not hasattr(loan, "fine"):
                overdue_days = max((loan.returned_at.date() - loan.due_at.date()).days, 1)
                fine_amount = overdue_days * 10
                total_fine_amount += fine_amount
                fines_to_create.append(Fine(
                    loan=loan,
                    amount=fine_amount,
                    reason="Overdue return",
                    status=fine_status,
                    payment_method=payment_method if is_paid else None
                ))

        BookCopy.objects.filter(id__in=copy_ids).update(status=BookCopy.AVAILABLE)

        if fines_to_create:
            Fine.objects.bulk_create(fines_to_create)

        msg = f"You have successfully returned {returned_count} book(s)."
        if total_fine_amount > 0:
            if is_paid:
                msg += f" Overdue fines of ₹{total_fine_amount} were paid."
            else:
                msg += f" Overdue fines of ₹{total_fine_amount} were added to your account dues."

        create_student_notification(
            user=borrower,
            notif_type="book_returned",
            title="Books Returned",
            message=msg,
            related_entity_id=loans[0].id
        )

        return Response({
            "detail": f"Successfully returned {returned_count} book(s).",
            "returned_count": returned_count,
            "total_fines": total_fine_amount,
            "fine_status": fine_status if total_fine_amount > 0 else None
        }, status=status.HTTP_200_OK)


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.select_related(
        "book__publisher",
        "book__category",
        "user",
        "allocated_copy"
    ).all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated and (self.request.user.is_staff or self.request.user.is_librarian_staff):
            return queryset
        return queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        if not self.request.user.is_active:
            raise ValidationError({"detail": "Your account is currently suspended. You cannot place reservations on books."})
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
                message=f"Good news! Your reserved book '{instance.book.title}' is now available. Please pick it up from the library.",
                related_entity_id=instance.id
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
                message=f"Your reservation for '{instance.book.title}' has been cancelled by the library.",
                related_entity_id=instance.id
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
        loan = Loan.objects.create(
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
            message=f"You have successfully borrowed '{locked_copy.book.title}'. It is due on {due_date.strftime('%Y-%m-%d')}.",
            related_entity_id=loan.id
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
            message=f"Your pickup deadline for '{reservation.book.title}' has been extended by 24 hours.",
            related_entity_id=reservation.id
        )
        
        return Response({"detail": "Pickup deadline extended successfully."}, status=status.HTTP_200_OK)