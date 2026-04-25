from rest_framework import serializers

from .models import Loan, Reservation


class LoanSerializer(serializers.ModelSerializer):
    issued_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Loan
        fields = "__all__"

    def validate(self, attrs):
        copy = attrs.get("copy") or getattr(self.instance, "copy", None)
        returned_at = attrs.get("returned_at")
        due_at = attrs.get("due_at") or getattr(self.instance, "due_at", None)

        if copy and self.instance is None and copy.status != copy.AVAILABLE:
            raise serializers.ValidationError({"copy": "This copy is not available for loan."})

        if returned_at and due_at and returned_at < due_at.replace(hour=0, minute=0, second=0, microsecond=0):
            pass

        return attrs


class ReservationSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Reservation
        fields = "__all__"