from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta

# Import your models exactly as they are structured in your codebase
from apps.inventory.models import BookCopy
from apps.circulation.models import Loan
from apps.billing.models import Fine

class DashboardStatsView(APIView):
    def get(self, request):
        now = timezone.now()
        # Calculate timestamps for 7 days ago and 30 days ago
        one_week_ago = now - timedelta(days=7)
        one_month_ago = now - timedelta(days=30)
        
        # 1. Total Inventory
        total_inventory = BookCopy.objects.count()
        # Count how many BookCopies were acquired in the last 7 and 30 days
        inventory_this_week = BookCopy.objects.filter(acquired_at__gte=one_week_ago.date()).count()
        inventory_this_month = BookCopy.objects.filter(acquired_at__gte=one_month_ago.date()).count()
        
        # 2. Total Borrowed
        total_borrowed = Loan.objects.filter(returned_at__isnull=True).count()
        borrowed_this_week = Loan.objects.filter(issued_at__gte=one_week_ago).count()
        borrowed_this_month = Loan.objects.filter(issued_at__gte=one_month_ago).count()
        
        # 3. Total Fines
        total_fines = Fine.objects.aggregate(Sum('amount'))['amount__sum'] or 0
        # Calculate how much fine was generated this month
        fines_this_month = Fine.objects.filter(created_at__gte=one_month_ago).aggregate(Sum('amount'))['amount__sum'] or 0
        
        # 4. Books Left
        books_left = total_inventory - total_borrowed
        
        # 5. Total Overdue
        total_overdue = Loan.objects.filter(
            returned_at__isnull=True, 
            due_at__lt=now
        ).count()
        
        overdue_this_week = Loan.objects.filter(
            returned_at__isnull=True, 
            due_at__lt=now,
            due_at__gte=one_week_ago
        ).count()

        return Response({
            "total_inventory": total_inventory,
            "inventory_this_week": inventory_this_week,
            "inventory_this_month": inventory_this_month,
            
            "total_borrowed": total_borrowed,
            "borrowed_this_week": borrowed_this_week,
            "borrowed_this_month": borrowed_this_month,
            
            "total_fines": total_fines,
            "fines_this_month": fines_this_month,
            
            "books_left": books_left,
            
            "total_overdue": total_overdue,
            "overdue_this_week": overdue_this_week,
        })
