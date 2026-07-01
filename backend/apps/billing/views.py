from rest_framework import viewsets

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