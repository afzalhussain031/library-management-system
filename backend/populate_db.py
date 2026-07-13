import os
import django
from datetime import timedelta
from django.utils import timezone

# 1. Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()

# 2. Import Models
from apps.accounts.models import CustomUser, Membership
from apps.catalog.models import Category, Publisher, Book, Wishlist
from apps.inventory.models import BookCopy
from apps.circulation.models import Loan, Reservation
from apps.billing.models import Fine
from apps.notifications.models import Notification

def populate():
    print("Starting database population...")

    # ==========================================
    # 3. Create Categories
    # ==========================================
    categories_data = [
        {"name": "Computer Science", "description": "Books related to programming, algorithms, and computing."},
        {"name": "Mathematics", "description": "Mathematics, calculus, algebra, and geometry."},
        {"name": "Physics", "description": "Quantum mechanics, classical mechanics, and relativity."},
        {"name": "Fiction", "description": "General fiction and literature."},
        {"name": "Science Fiction", "description": "Sci-fi novels and stories."},
        {"name": "History", "description": "World history and historical analysis."},
        {"name": "Biography", "description": "Biographies and autobiographies of notable figures."},
        {"name": "Philosophy", "description": "Philosophical texts and essays."},
        {"name": "Business & Economics", "description": "Finance, business management, and economics."},
        {"name": "Art & Design", "description": "Books on visual arts, graphic design, and architecture."},
    ]
    
    categories = {}
    for data in categories_data:
        cat, _ = Category.objects.get_or_create(name=data["name"], defaults={"description": data["description"]})
        categories[data["name"]] = cat
    print(f"Created {len(categories)} categories.")

    # ==========================================
    # 4. Create Publishers
    # ==========================================
    publishers_data = [
        {"name": "O'Reilly Media", "address": "1005 Gravenstein Highway North, Sebastopol, CA 95472"},
        {"name": "Pearson Education", "address": "330 Hudson St, New York, NY 10013"},
        {"name": "McGraw Hill", "address": "1325 Avenue of the Americas, New York, NY 10019"},
        {"name": "Penguin Random House", "address": "1745 Broadway, New York, NY 10019"},
        {"name": "HarperCollins", "address": "195 Broadway, New York, NY 10007"},
        {"name": "Simon & Schuster", "address": "1230 Avenue of the Americas, New York, NY 10020"},
        {"name": "Springer", "address": "Heidelberger Platz 3, 14197 Berlin, Germany"},
        {"name": "MIT Press", "address": "1 Broadway, 12th Floor, Cambridge, MA 02142"},
        {"name": "Wiley", "address": "111 River Street, Hoboken, NJ 07030"},
        {"name": "Routledge", "address": "11 New Fetter Lane, London EC4P 4EE, UK"},
    ]
    
    publishers = {}
    for data in publishers_data:
        pub, _ = Publisher.objects.get_or_create(name=data["name"], defaults={"address": data["address"]})
        publishers[data["name"]] = pub
    print(f"Created {len(publishers)} publishers.")

    # ==========================================
    # 5. Create Users & Memberships
    # ==========================================
    users_data = [
        {"user_id": "STU001", "first": "Alice", "last": "Johnson", "email": "alice.j@example.com", "role": "student"},
        {"user_id": "STU002", "first": "Bob", "last": "Smith", "email": "bob.smith@example.com", "role": "student"},
        {"user_id": "STU003", "first": "Charlie", "last": "Brown", "email": "charlie.b@example.com", "role": "student"},
        {"user_id": "STU004", "first": "Diana", "last": "Prince", "email": "diana.p@example.com", "role": "student"},
        {"user_id": "STU005", "first": "Evan", "last": "Wright", "email": "evan.w@example.com", "role": "student"},
        {"user_id": "STU006", "first": "Fiona", "last": "Gallagher", "email": "fiona.g@example.com", "role": "student"},
        {"user_id": "STU007", "first": "George", "last": "Miller", "email": "george.m@example.com", "role": "student"},
        {"user_id": "LIB001", "first": "Hannah", "last": "Abbott", "email": "hannah.lib@example.com", "role": "librarian"},
        {"user_id": "LIB002", "first": "Ian", "last": "Malcolm", "email": "ian.lib@example.com", "role": "librarian"},
        {"user_id": "STF001", "first": "Julia", "last": "Roberts", "email": "julia.staff@example.com", "role": "staff"},
    ]
    
    users = {}
    for data in users_data:
        try:
            user = CustomUser.objects.get(user_id=data["user_id"])
        except CustomUser.DoesNotExist:
            user = CustomUser.objects.create_user(
                user_id=data["user_id"],
                email=data["email"],
                password="password123",
                role=data["role"],
                first_name=data["first"],
                last_name=data["last"]
            )
        users[data["user_id"]] = user
        
        # Create Memberships
        valid_till_date = timezone.now().date() + timedelta(days=365 * (4 if data["role"] == "student" else 10))
        Membership.objects.get_or_create(
            user=user, 
            defaults={"membership_id": f"MEM-{data['user_id']}", "valid_till": valid_till_date}
        )
    print(f"Created {len(users)} users and memberships.")

    # ==========================================
    # 6. Create Books
    # ==========================================
    books_data = [
        {"title": "Clean Code", "author": "Robert C. Martin", "date": "2008-08-01", "isbn": "9780132350884", "cat": "Computer Science", "pub": "Pearson Education"},
        {"title": "Design Patterns", "author": "Erich Gamma et al.", "date": "1994-10-31", "isbn": "9780201633610", "cat": "Computer Science", "pub": "Pearson Education"},
        {"title": "The Pragmatic Programmer", "author": "Andrew Hunt", "date": "1999-10-20", "isbn": "9780201616224", "cat": "Computer Science", "pub": "O'Reilly Media"},
        {"title": "Introduction to Algorithms", "author": "Thomas H. Cormen", "date": "2009-07-31", "isbn": "9780262033848", "cat": "Computer Science", "pub": "MIT Press"},
        {"title": "Calculus, 8th Edition", "author": "James Stewart", "date": "2015-05-19", "isbn": "9781285740621", "cat": "Mathematics", "pub": "McGraw Hill"},
        {"title": "The Martian", "author": "Andy Weir", "date": "2014-02-11", "isbn": "9780804139021", "cat": "Science Fiction", "pub": "Penguin Random House"},
        {"title": "Dune", "author": "Frank Herbert", "date": "1965-08-01", "isbn": "9780441172719", "cat": "Science Fiction", "pub": "Penguin Random House"},
        {"title": "Sapiens: A Brief History", "author": "Yuval Noah Harari", "date": "2015-02-10", "isbn": "9780062316097", "cat": "History", "pub": "HarperCollins"},
        {"title": "Meditations", "author": "Marcus Aurelius", "date": "2002-05-14", "isbn": "9780812968255", "cat": "Philosophy", "pub": "Penguin Random House"},
        {"title": "Thinking, Fast and Slow", "author": "Daniel Kahneman", "date": "2011-10-25", "isbn": "9780374275631", "cat": "Business & Economics", "pub": "Simon & Schuster"},
    ]
    
    books = {}
    for data in books_data:
        book, _ = Book.objects.get_or_create(
            isbn=data["isbn"],
            defaults={
                "title": data["title"],
                "author": data["author"],
                "published_date": data["date"],
                "category": categories[data["cat"]],
                "publisher": publishers[data["pub"]],
                "added_by": users["LIB001"],
            }
        )
        books[data["title"]] = book
    print(f"Created {len(books)} books.")

    # ==========================================
    # 7. Create Book Copies
    # ==========================================
    copies_data = [
        {"book": "Clean Code", "accession": "CPY-001", "status": BookCopy.AVAILABLE},
        {"book": "Clean Code", "accession": "CPY-002", "status": BookCopy.LOANED},
        {"book": "Design Patterns", "accession": "CPY-003", "status": BookCopy.AVAILABLE},
        {"book": "The Pragmatic Programmer", "accession": "CPY-004", "status": BookCopy.AVAILABLE},
        {"book": "Introduction to Algorithms", "accession": "CPY-005", "status": BookCopy.MAINTENANCE},
        {"book": "Calculus, 8th Edition", "accession": "CPY-006", "status": BookCopy.AVAILABLE},
        {"book": "The Martian", "accession": "CPY-007", "status": BookCopy.LOANED},
        {"book": "Dune", "accession": "CPY-008", "status": BookCopy.AVAILABLE},
        {"book": "Sapiens: A Brief History", "accession": "CPY-009", "status": BookCopy.MAINTENANCE},
        {"book": "Thinking, Fast and Slow", "accession": "CPY-010", "status": BookCopy.AVAILABLE},
    ]

    copies = {}
    for data in copies_data:
        copy, _ = BookCopy.objects.get_or_create(
            accession_number=data["accession"],
            defaults={"book": books[data["book"]], "status": data["status"], "shelf_location": "A1"}
        )
        copies[data["accession"]] = copy
    print(f"Created {len(copies)} book copies.")

    # ==========================================
    # 8. Create Loans
    # ==========================================
    now = timezone.now()
    loans_data = [
        {"copy": "CPY-002", "user": "STU001", "due_days": 9, "returned": False},
        {"copy": "CPY-007", "user": "STU002", "due_days": 12, "returned": False},
        {"copy": "CPY-004", "user": "STU003", "due_days": -6, "returned": True},
        {"copy": "CPY-006", "user": "STU004", "due_days": -16, "returned": False},
        {"copy": "CPY-010", "user": "STU005", "due_days": 13, "returned": False},
        {"copy": "CPY-008", "user": "STU006", "due_days": 4, "returned": False},
        {"copy": "CPY-001", "user": "STU007", "due_days": -1, "returned": True},
        {"copy": "CPY-003", "user": "STU001", "due_days": 11, "returned": False},
        {"copy": "CPY-005", "user": "STU002", "due_days": -26, "returned": False},
        {"copy": "CPY-009", "user": "STU003", "due_days": 9, "returned": False},
    ]

    loans_list = []
    for data in loans_data:
        loan, created = Loan.objects.get_or_create(
            copy=copies[data["copy"]],
            borrower=users[data["user"]],
            defaults={
                "due_at": now + timedelta(days=data["due_days"]),
                "returned_at": now if data["returned"] else None
            }
        )
        if created:
            loans_list.append(loan)
    print(f"Created {len(loans_list)} new loans.")

    # ==========================================
    # 9. Create Reservations
    # ==========================================
    reservations_data = [
        {"book": "Clean Code", "user": "STU003", "status": Reservation.PENDING},
        {"book": "Design Patterns", "user": "STU004", "status": Reservation.PENDING},
        {"book": "The Pragmatic Programmer", "user": "STU005", "status": Reservation.FULFILLED},
        {"book": "Introduction to Algorithms", "user": "STU006", "status": Reservation.PENDING},
        {"book": "Calculus, 8th Edition", "user": "STU007", "status": Reservation.CANCELLED},
        {"book": "The Martian", "user": "STU001", "status": Reservation.PENDING},
        {"book": "Dune", "user": "STU002", "status": Reservation.PENDING},
        {"book": "Sapiens: A Brief History", "user": "STU003", "status": Reservation.FULFILLED},
        {"book": "Meditations", "user": "STU004", "status": Reservation.PENDING},
        {"book": "Thinking, Fast and Slow", "user": "STU005", "status": Reservation.PENDING},
    ]

    for data in reservations_data:
        Reservation.objects.get_or_create(
            book=books[data["book"]],
            user=users[data["user"]],
            status=data["status"]
        )
    print("Created reservations.")

    # ==========================================
    # 10. Create Wishlist
    # ==========================================
    wishlist_data = [
        ("STU001", "Sapiens: A Brief History"), ("STU002", "Meditations"),
        ("STU003", "Clean Code"), ("STU004", "Dune"),
        ("STU005", "The Martian"), ("STU006", "Introduction to Algorithms"),
        ("STU007", "Thinking, Fast and Slow"), ("STU001", "Calculus, 8th Edition"),
        ("STU002", "Design Patterns"), ("STU003", "The Pragmatic Programmer"),
    ]

    for user_id, book_title in wishlist_data:
        Wishlist.objects.get_or_create(user=users[user_id], book=books[book_title])
    print("Created wishlist items.")

    # ==========================================
    # 11. Create Fines (Mapping to the active loans)
    # ==========================================
    if loans_list:
        fines_data = [
            {"loan": loans_list[0], "amt": 15.00, "reason": "Late Return", "status": Fine.PENDING},
            {"loan": loans_list[1], "amt": 5.00, "reason": "Late Return", "status": Fine.PAID},
            {"loan": loans_list[2], "amt": 50.00, "reason": "Lost Book", "status": Fine.PENDING},
            {"loan": loans_list[3], "amt": 2.00, "reason": "Late Return", "status": Fine.PAID},
            {"loan": loans_list[4], "amt": 10.00, "reason": "Damaged Book", "status": Fine.PENDING},
        ]
        
        for data in fines_data:
            Fine.objects.get_or_create(
                loan=data["loan"],
                defaults={"amount": data["amt"], "reason": data["reason"], "status": data["status"]}
            )
        print("Created fines.")

    # ==========================================
    # 12. Create Notifications
    # ==========================================
    notifications_data = [
        {"user": "STU001", "type": "reservation_ready", "title": "Book Ready", "msg": "Your reserved book 'The Martian' is now available.", "read": False},
        {"user": "STU002", "type": "book_overdue", "title": "Due Reminder", "msg": "Reminder: Your loan for 'The Martian' is due in 2 days.", "read": True},
        {"user": "STU003", "type": "fine_paid", "title": "Fine Paid", "msg": "Your fine of $5.00 has been successfully paid.", "read": True},
        {"user": "STU004", "type": "book_overdue", "title": "Overdue Notice", "msg": "OVERDUE NOTICE: 'Calculus, 8th Edition' is overdue.", "read": False},
        {"user": "STU005", "type": "book_issued", "title": "Welcome", "msg": "Welcome to the Library Management System!", "read": True},
    ]

    for data in notifications_data:
        Notification.objects.get_or_create(
            user=users[data["user"]],
            title=data["title"],
            defaults={"notification_type": data["type"], "message": data["msg"], "read": data["read"]}
        )
    print("Created notifications.")

    print("\nDatabase populated successfully!")

if __name__ == "__main__":
    populate()
