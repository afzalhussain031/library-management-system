import { dashboard } from "../../../services/api";
import { useApi } from "../../../hook/useApi";
import ErrorMessage from "../../common/ErrorMessage";
import { SkeletonAvatar, SkeletonText } from "../../common/Skeleton";

export default function Notifications() {
  const { data, isLoading: loading, error } = useApi(dashboard.getNotifications, []);
  
  const notifList = Array.isArray(data) ? data : data?.results || [];
  const notifications = notifList.slice(0, 3);



  // Remove early loading return

  if (error) {
    return (
      <div className="bg-white p-2 rounded-3xl shadow-md border border-gray-100 h-32">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="bg-white p-2 rounded-3xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer">
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        <button 
          onClick={() => document.dispatchEvent(new Event('openNotificationDropdown'))}
          className="text-sm text-gray-600 hover:text-black flex items-center gap-1 cursor-pointer"
        >
          View All →
        </button>
      </div>

      <div className="space-y-5">
        {loading ? (
          [1, 2, 3].map(key => (
            <div key={key} className="flex items-center justify-between px-2">
              <div className="flex items-start gap-4">
                <SkeletonAvatar className="w-12 h-12 rounded-lg" />
                <div className="space-y-2 mt-1">
                  <SkeletonText className="h-4 w-32" />
                  <SkeletonText className="h-3 w-48" />
                </div>
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
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