from django.contrib import admin

from .models import Loan, Reservation

admin.site.register(Loan)
admin.site.register(Reservation)