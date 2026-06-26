from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone

# Import your models exactly as they are structured in your codebase
from apps.inventory.models import BookCopy
from apps.circulation.models import Loan
from apps.billing.models import Fine

class DashboardStatsView(APIView):
    def get(self, request):
        # 1. Total Inventory (BookCopy count)
        total_inventory = BookCopy.objects.count()
        
        # 2. Total Borrowed (Loans where returned_at is null)
        total_borrowed = Loan.objects.filter(returned_at__isnull=True).count()
        
        # 3. Total Fines (Summing the amount field in Fine model)
        total_fines = Fine.objects.aggregate(Sum('amount'))['amount__sum'] or 0
        
        # 4. Books Left
        books_left = total_inventory - total_borrowed

        # Total Overdue (Loans not returned AND due date has passed)
        total_overdue = Loan.objects.filter(
            returned_at__isnull=True, 
            due_at__lt=timezone.now()
        ).count()

        return Response({
            "total_inventory": total_inventory,
            "total_borrowed": total_borrowed,
            "total_fines": total_fines,
            "books_left": books_left,
            "total_overdue": total_overdue
        })
