import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { notificationService } from "../../../services/apiClient";

interface NotificationData {
  id: number;
  title: string;
  message: string;
  created_at: string;
}

export function NotificationsCard({ className }: React.ComponentProps<"div">) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.fetch();
        setNotifications(data.slice(0, 3)); // Show last 3 notifications
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="font-bold">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-bold">Notifications</CardTitle>
      </CardHeader>

      <CardContent className="py-4 space-y-4">
        {notifications.length === 0 ? (
          <p className="text-muted-foreground">No notifications</p>
        ) : (
          notifications.map(notification => (
            <NotificationsCardContent key={notification.id} notification={notification} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function NotificationsCardContent({ notification }: { notification: NotificationData }) {
  const timeAgo = new Date(notification.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return (
    <div>
      <h4 className="font-medium">{notification.title}</h4>
      <span className="text-muted-foreground">{timeAgo}</span>
    </div>
  );
}
