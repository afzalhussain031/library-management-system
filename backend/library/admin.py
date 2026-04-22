from django.contrib import admin
from .models import Book, BookCopy, Category, Fine, Loan, Publisher, Reservation, UserProfile

admin.site.register(Book)
admin.site.register(Category)
admin.site.register(Publisher)
admin.site.register(BookCopy)
admin.site.register(Loan)
admin.site.register(Reservation)
admin.site.register(Fine)
admin.site.register(UserProfile)