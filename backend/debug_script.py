import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.base")
django.setup()

from apps.inventory.models import BookCopy
from apps.circulation.models import Loan

print("Available:", BookCopy.objects.filter(status='available').count())
print("TotalActiveLoans:", Loan.objects.filter(returned_at__isnull=True).count())
print("ActiveLoansOnAvailableCopies:", Loan.objects.filter(returned_at__isnull=True, copy__status='available').count())

from collections import Counter
c = Counter(Loan.objects.filter(returned_at__isnull=True).values_list('copy_id', flat=True))
print("Copies with multiple active loans:", [k for k, v in c.items() if v > 1])
