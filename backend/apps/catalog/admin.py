from django.contrib import admin

from .models import Book, Category, Publisher, Wishlist, SearchHistory

admin.site.register(Book)
admin.site.register(Category)
admin.site.register(Publisher)
admin.site.register(Wishlist)
admin.site.register(SearchHistory)