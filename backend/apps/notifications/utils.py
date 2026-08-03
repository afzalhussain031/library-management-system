from .models import Notification

def create_student_notification(user, notif_type, title, message, related_entity_id=None):
    """
    Helper function to create notifications.
    Valid notif_type values: "book_issued", "book_returned", "book_overdue",
    "fine_created", "fine_paid", "reservation_ready", "reservation_cancelled"
    """
    if not user:
        return None
        
    return Notification.objects.create(
        user=user,
        notification_type=notif_type,
        title=title,
        message=message,
        related_entity_id=related_entity_id
    )
