from rest_framework import viewsets
from apps.notifications.utils import create_student_notification

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
            return queryset
            
        return queryset.filter(loan__borrower=user)

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