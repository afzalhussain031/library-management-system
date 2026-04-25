from rest_framework import serializers

from .models import Fine


class FineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fine
        fields = "__all__"