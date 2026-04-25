from datetime import timedelta

from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from common.permissions.base import IsStaffOrReadOnly
from apps.billing.models import Fine
from apps.inventory.models import BookCopy

from .models import Loan, Reservation
from .serializers import LoanSerializer, ReservationSerializer


class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.select_related("copy", "borrower").all()
    serializer_class = LoanSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset
        return queryset.filter(borrower=self.request.user)

    def perform_create(self, serializer):
        copy = serializer.validated_data["copy"]
        if copy.status != BookCopy.AVAILABLE:
            raise ValidationError({"copy": "This copy is not available."})

        loan = serializer.save()
        copy.status = BookCopy.LOANED
        copy.save(update_fields=["status"])
        return loan

    def perform_update(self, serializer):
        loan = serializer.save()

        if loan.returned_at and loan.copy.status != BookCopy.AVAILABLE:
            loan.copy.status = BookCopy.AVAILABLE
            loan.copy.save(update_fields=["status"])

            if loan.returned_at > loan.due_at and not hasattr(loan, "fine"):
                overdue_days = max((loan.returned_at.date() - loan.due_at.date()).days, 1)
                Fine.objects.create(
                    loan=loan,
                    amount=overdue_days * 10,
                    reason="Overdue return",
                )

    @action(detail=True, methods=["post"])
    def return_loan(self, request, pk=None):
        loan = self.get_object()
        if loan.returned_at:
            return Response({"detail": "This loan is already closed."}, status=status.HTTP_400_BAD_REQUEST)

        loan.returned_at = timezone.now()
        loan.save(update_fields=["returned_at"])

        loan.copy.status = BookCopy.AVAILABLE
        loan.copy.save(update_fields=["status"])

        if loan.returned_at > loan.due_at and not hasattr(loan, "fine"):
            overdue_days = max((loan.returned_at.date() - loan.due_at.date()).days, 1)
            fine = Fine.objects.create(
                loan=loan,
                amount=overdue_days * 10,
                reason="Overdue return",
            )
            return Response(
                {"detail": "Book returned with fine.", "fine_id": fine.id},
                status=status.HTTP_200_OK,
            )

        return Response({"detail": "Book returned successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def renew(self, request, pk=None):
        loan = self.get_object()
        if loan.returned_at:
            raise ValidationError({"detail": "Returned loans cannot be renewed."})

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
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset
        return queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)