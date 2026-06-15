import { useState, useEffect } from "react";
import { dashboard } from "../../services/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await dashboard.getNotifications();
        const notifList = Array.isArray(response) ? response : response.results || [];
        
        // Get last 3 notifications
        const recentNotifs = notifList.slice(0, 3);
        setNotifications(recentNotifs);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-2 rounded-3xl shadow-md border border-gray-100 flex items-center justify-center h-32">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-2 rounded-3xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer">
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        <button className="text-sm text-gray-600 hover:text-black flex items-center gap-1">
          View All →
        </button>
      </div>

      <div className="space-y-5">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm p-4">No notifications</p>
        ) : (
          notifications.map((notif, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-6 h-8 min-w-12 rounded-lg bg-yellow-200 flex items-center justify-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
                </div>

                <div>
                  <p className="font-semibold text-gray-900">{notif.title || "Notification"}</p>
                  <p className="text-sm text-gray-500">{notif.message || "No message"}</p>
                </div>

                <span className="text-gray-400 text-lg cursor-pointer">›</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}