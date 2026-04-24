import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

const notifications = [
  { title: "Atomic Habits", timeAgo: "4 hours ago", date: "02 Dec 2022" },
  { title: "Python Basics", timeAgo: "4 hours ago", date: "30 Dec 2022" },
  { title: "Critique of Pure...", timeAgo: "4 hours ago", date: "15 Nov 2022" }
];

export function NotificationsCard({ className }: React.ComponentProps<"div">) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-bold">Notifications</CardTitle>
      </CardHeader>

      <CardContent className="py-4 space-y-4">
        {notifications.map(notification => <NotificationsCardContent key={notification.title} {...{ notification }} />)}
      </CardContent>
    </Card>
  );
}

function NotificationsCardContent({ notification }: { notification: typeof notifications[number]; }) {
  return (
    <div>
      <h4 className="font-medium">{notification.title}</h4>
      <span className="text-muted-foreground">{notification.timeAgo} . {notification.date}</span>
    </div>
  );
}
