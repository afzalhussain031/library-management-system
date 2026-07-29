from django.contrib import admin

from .models import Book, Category, Publisher, Review

admin.site.register(Book)
admin.site.register(Category)
admin.site.register(Publisher)
admin.site.register(Review)