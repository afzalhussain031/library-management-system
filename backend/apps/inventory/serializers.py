from django.utils import timezone
from rest_framework import serializers

from .models import BookCopy


class BookCopySerializer(serializers.ModelSerializer):
    current_loan = serializers.SerializerMethodField()
    current_reservation = serializers.SerializerMethodField()

    class Meta:
        model = BookCopy
        fields = [
            "id",
            "book",
            "accession_number",
            "status",
            "condition",
            "shelf_location",
            "acquired_at",
            "current_loan",
            "current_reservation",
        ]

    def get_current_loan(self, obj):
        # Find active loan (returned_at is None)
        # Using obj.loans.all() allows prefetch_related to resolve without extra SQL queries
        active_loan = next(
            (loan for loan in obj.loans.all() if loan.returned_at is None),
            None
        )
        if not active_loan:
            return None

        borrower = active_loan.borrower
        name = (borrower.student_name or borrower.get_full_name() or "").strip() or borrower.user_id
        return {
            "id": active_loan.id,
            "borrower_id": borrower.id,
            "borrower_user_id": borrower.user_id,
            "borrower_name": name,
            "issued_at": active_loan.issued_at,
            "due_at": active_loan.due_at,
            "is_overdue": (
                timezone.now().date() > active_loan.due_at.date()
                if active_loan.due_at
                else False
            ),
        }

    def get_current_reservation(self, obj):
        from apps.circulation.models import Reservation

        # Find active ready/pending reservation allocated to this copy
        active_res = next(
            (
                res
                for res in obj.allocated_reservations.all()
                if res.status in [Reservation.READY, Reservation.PENDING]
            ),
            None,
        )
        if not active_res:
            return None

        user = active_res.user
        name = (user.student_name or user.get_full_name() or "").strip() or user.user_id
        return {
            "id": active_res.id,
            "user_id": user.id,
            "member_user_id": user.user_id,
            "user_name": name,
            "status": active_res.status,
            "ready_at": active_res.ready_at,
            "is_extended": active_res.is_extended,
        }