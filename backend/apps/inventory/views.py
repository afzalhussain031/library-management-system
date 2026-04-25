from rest_framework import viewsets

from common.permissions.base import IsStaffOrReadOnly

from .models import BookCopy
from .serializers import BookCopySerializer


class BookCopyViewSet(viewsets.ModelViewSet):
    queryset = BookCopy.objects.select_related("book").all()
    serializer_class = BookCopySerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset
        return queryset.filter(status=BookCopy.AVAILABLE)