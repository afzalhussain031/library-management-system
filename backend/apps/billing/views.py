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
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset
        return queryset.filter(loan__borrower=self.request.user)