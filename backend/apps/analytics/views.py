from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta

# Import your models exactly as they are structured in your codebase
from apps.inventory.models import BookCopy
from apps.circulation.models import Loan, Reservation
from apps.billing.models import Fine
from apps.circulation.serializers import LoanSerializer, ReservationSerializer

class DashboardStatsView(APIView):
    def get(self, request):
        now = timezone.now()
        # Calculate timestamps for 7 days ago and 30 days ago
        one_week_ago = now - timedelta(days=7)
        one_month_ago = now - timedelta(days=30)
        two_months_ago = now - timedelta(days=60)
        
        # 1. Total Inventory
        total_inventory = BookCopy.objects.count()
        # Count how many BookCopies were acquired in the last 7 and 30 days
        inventory_this_week = BookCopy.objects.filter(acquired_at__gte=one_week_ago.date()).count()
        inventory_this_month = BookCopy.objects.filter(acquired_at__gte=one_month_ago.date()).count()
        inventory_last_month = BookCopy.objects.filter(acquired_at__gte=two_months_ago.date(), acquired_at__lt=one_month_ago.date()).count()
        
        # 2. Total Borrowed
        total_borrowed = BookCopy.objects.filter(status=BookCopy.LOANED).count()
        borrowed_this_week = Loan.objects.filter(issued_at__gte=one_week_ago).count()
        borrowed_this_month = Loan.objects.filter(issued_at__gte=one_month_ago).count()
        borrowed_last_month = Loan.objects.filter(issued_at__gte=two_months_ago, issued_at__lt=one_month_ago).count()
        
        # 3. Total Fines
        total_fines = Fine.objects.aggregate(Sum('amount'))['amount__sum'] or 0
        fines_this_month = Fine.objects.filter(created_at__gte=one_month_ago).aggregate(Sum('amount'))['amount__sum'] or 0
        
        # 4. Books Left
        books_left = BookCopy.objects.filter(status=BookCopy.AVAILABLE).count()
        
        # 5. Total Overdue
        total_overdue = Loan.objects.filter(
            returned_at__isnull=True, 
            due_at__lt=now,
            copy__status=BookCopy.LOANED  # Added: Ensures the physical book is actually missing
        ).count()
        
        overdue_this_week = Loan.objects.filter(
            returned_at__isnull=True, 
            due_at__lt=now,
            due_at__gte=one_week_ago,
            copy__status=BookCopy.LOANED  # Added: Ensures the physical book is actually missing
        ).count()

        # 2. FETCH THE TOP 5 RECORDS
        # Get the 5 most recent reservations
        recent_reservations = Reservation.objects.filter(status=Reservation.PENDING).order_by('-reserved_at')[:5]        
        
        # Get the 5 most recent loans
        recent_loans = Loan.objects.order_by('-issued_at')[:5]
        
        # Get the 5 most critical overdue loans (oldest due_at first)
        overdue_loans = Loan.objects.filter(
            returned_at__isnull=True, 
            due_at__lt=now,
            copy__status=BookCopy.LOANED  # Added: Ensures the physical book is actually missing
        ).order_by('due_at')[:5]

        return Response({
            "total_inventory": total_inventory,
            "inventory_this_week": inventory_this_week,
            "inventory_this_month": inventory_this_month,
            "inventory_last_month": inventory_last_month,
            
            "total_borrowed": total_borrowed,
            "borrowed_this_week": borrowed_this_week,
            "borrowed_this_month": borrowed_this_month,
            "borrowed_last_month": borrowed_last_month,
            
            "total_fines": total_fines,
            "fines_this_month": fines_this_month,
            
            "books_left": books_left,
            
            "total_overdue": total_overdue,
            "overdue_this_week": overdue_this_week,

            "recent_reservations": ReservationSerializer(recent_reservations, many=True).data,
            "recent_loans": LoanSerializer(recent_loans, many=True).data,
            "overdue_loans": LoanSerializer(overdue_loans, many=True).data,
        })
