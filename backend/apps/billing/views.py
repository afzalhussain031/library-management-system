from rest_framework import viewsets
from rest_framework.response import Response
from django.utils import timezone
from apps.notifications.utils import create_student_notification
from apps.circulation.models import Loan

from common.permissions.base import IsStaffOrReadOnly

from .models import Fine
from .serializers import FineSerializer


class FineViewSet(viewsets.ModelViewSet):
    queryset = Fine.objects.select_related("loan").all()
    serializer_class = FineSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Check if user is any kind of staff/admin
        is_admin = False
        if user.is_authenticated:
            if user.is_staff or getattr(user, 'role', '') in ['staff', 'librarian', 'superadmin']:
                is_admin = True
                
        if is_admin:
            user_id = self.request.query_params.get('user_id')
            if user_id:
                return queryset.filter(loan__borrower_id=user_id)
            return queryset
            
        return queryset.filter(loan__borrower=user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            db_fines = serializer.data
        else:
            serializer = self.get_serializer(queryset, many=True)
            db_fines = serializer.data

        accrued_fines = []
        user = request.user
        
        if user.is_authenticated:
            loan_qs = Loan.objects.select_related("copy__book", "borrower").filter(
                returned_at__isnull=True, 
                due_at__lt=timezone.now()
            )
            
            is_admin = user.is_staff or getattr(user, 'role', '') in ['staff', 'librarian', 'superadmin']
            if not is_admin:
                loan_qs = loan_qs.filter(borrower=user)
                
            for loan in loan_qs:
                overdue_days = max((timezone.now().date() - loan.due_at.date()).days, 1)
                amount = overdue_days * 10
                
                accrued_fines.append({
                    "id": f"accrued-{loan.id}",
                    "loan": loan.id,
                    "loan_book_title": loan.copy.book.title if loan.copy and loan.copy.book else "Unknown",
                    "loan_book_author": loan.copy.book.author if loan.copy and loan.copy.book else "Unknown",
                    "borrower_name": loan.borrower.get_full_name(),
                    "borrower_email": loan.borrower.email,
                    "borrower_id": loan.borrower.id,
                    "loan_due_at": loan.due_at,
                    "loan_returned_at": None,
                    "loan_copy_barcode": getattr(loan.copy, "accession_number", "") if loan.copy else "",
                    "amount": amount,
                    "reason": "Accruing Overdue Fine",
                    "status": "pending",
                    "waive_reason": None,
                    "payment_method": None,
                    "created_at": timezone.now(),
                    "is_paid": False,
                    "is_accrued": True,
                })

        final_fines = db_fines + accrued_fines

        if page is not None:
            res = self.get_paginated_response(final_fines)
            res.data['results'] = final_fines
            return res

        return Response(final_fines)

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        fine = serializer.save()
        
        # Check if fine was just paid
        if old_status != 'paid' and fine.status == 'paid':
            create_student_notification(
                user=fine.loan.borrower,
                notif_type="fine_paid",
                title="Fine Paid Successfully",
                message=f"Your fine payment of ₹{fine.amount} for '{fine.loan.copy.book.title}' has been processed. Thank you!"
            )