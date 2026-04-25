from rest_framework import serializers

from .models import BookCopy


class BookCopySerializer(serializers.ModelSerializer):
    class Meta:
        model = BookCopy
        fields = "__all__"