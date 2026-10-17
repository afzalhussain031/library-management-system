from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
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
        
        # 1. Total Inventory & Status (Combined into 1 single SQL query)
        inventory_stats = BookCopy.objects.aggregate(
            total=Count('id'),
            this_week=Count('id', filter=Q(acquired_at__gte=one_week_ago.date())),
            this_month=Count('id', filter=Q(acquired_at__gte=one_month_ago.date())),
            last_month=Count('id', filter=Q(acquired_at__gte=two_months_ago.date(), acquired_at__lt=one_month_ago.date())),
            total_borrowed=Count('id', filter=Q(status=BookCopy.LOANED)),
            books_left=Count('id', filter=Q(status=BookCopy.AVAILABLE)),
        )
        total_inventory = inventory_stats['total']
        inventory_this_week = inventory_stats['this_week']
        inventory_this_month = inventory_stats['this_month']
        inventory_last_month = inventory_stats['last_month']
        total_borrowed = inventory_stats['total_borrowed']
        books_left = inventory_stats['books_left']

        # 2. Total Borrowed & Overdue Metrics (Combined into 1 single SQL query)
        loan_stats = Loan.objects.aggregate(
            borrowed_this_week=Count('id', filter=Q(issued_at__gte=one_week_ago)),
            borrowed_this_month=Count('id', filter=Q(issued_at__gte=one_month_ago)),
            borrowed_last_month=Count('id', filter=Q(issued_at__gte=two_months_ago, issued_at__lt=one_month_ago)),
            total_overdue=Count('id', filter=Q(returned_at__isnull=True, due_at__lt=now, copy__status=BookCopy.LOANED)),
            overdue_this_week=Count('id', filter=Q(returned_at__isnull=True, due_at__lt=now, due_at__gte=one_week_ago, copy__status=BookCopy.LOANED)),
        )
        borrowed_this_week = loan_stats['borrowed_this_week']
        borrowed_this_month = loan_stats['borrowed_this_month']
        borrowed_last_month = loan_stats['borrowed_last_month']
        total_overdue = loan_stats['total_overdue']
        overdue_this_week = loan_stats['overdue_this_week']

        # 3. Total Fines (Combined into 1 single SQL query)
        fines_stats = Fine.objects.aggregate(
            total=Sum('amount'),
            this_month=Sum('amount', filter=Q(created_at__gte=one_month_ago)),
        )
        total_fines = fines_stats['total'] or 0
        fines_this_month = fines_stats['this_month'] or 0

        # 2. FETCH THE TOP 5 RECORDS
        # Get the 5 most recent reservations with eager-loaded relations
        recent_reservations = Reservation.objects.filter(
            status=Reservation.PENDING
        ).select_related(
            'book__publisher', 'book__category', 'user', 'allocated_copy'
        ).order_by('-reserved_at')[:5]        
        
        # Get the 5 most recent loans with eager-loaded relations
        recent_loans = Loan.objects.select_related(
            'borrower', 'copy__book__publisher', 'copy__book__category'
        ).order_by('-issued_at')[:5]
        
        # Get the 5 most critical overdue loans with eager-loaded relations
        overdue_loans = Loan.objects.filter(
            returned_at__isnull=True, 
            due_at__lt=now,
            copy__status=BookCopy.LOANED  # Added: Ensures the physical book is actually missing
        ).select_related(
            'borrower', 'copy__book__publisher', 'copy__book__category'
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
