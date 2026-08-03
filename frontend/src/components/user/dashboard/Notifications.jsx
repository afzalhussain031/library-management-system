import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { dashboard } from "../../../services/api";
import { useApi } from "../../../hook/useApi";
import ErrorMessage from "../../common/ErrorMessage";
import { SkeletonAvatar, SkeletonText } from "../../common/Skeleton";
import { formatRelativeTime } from "../../../utils/formatDate";

const getBoxColors = (type) => {
  switch (type) {
    case 'book_overdue': return { outer: 'bg-red-200', inner: 'bg-red-500' };
    case 'book_issued':
    case 'book_returned': return { outer: 'bg-green-200', inner: 'bg-green-500' };
    case 'fine_created':
    case 'fine_paid': return { outer: 'bg-pink-200', inner: 'bg-pink-500' };
    case 'reservation_ready':
    case 'reservation_cancelled': return { outer: 'bg-blue-200', inner: 'bg-blue-500' };
    default: return { outer: 'bg-yellow-200', inner: 'bg-yellow-500' };
  }
};

export default function Notifications() {
  const navigate = useNavigate();
  const { data, isLoading: loading, error } = useApi(dashboard.getNotifications, []);
  
  const notifList = Array.isArray(data) ? data : data?.results || [];
  const notifications = notifList.slice(0, 3);

  const handleNotificationClick = (type) => {
    switch (type) {
      case 'fine_created':
      case 'fine_paid':
        navigate('/my-fines');
        break;
      case 'reservation_ready':
      case 'reservation_cancelled':
        navigate('/my-reservations');
        break;
      case 'book_issued':
      case 'book_returned':
      case 'book_overdue':
        navigate('/my-loans');
        break;
      default:
        break;
    }
  };

  if (error) {
    return (
      <div className="bg-white p-2 rounded-3xl shadow-md border border-gray-100 h-32 flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="bg-white p-2 rounded-3xl shadow-md border border-gray-100 flex flex-col h-full">
      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer mb-2">
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        <button 
          onClick={() => document.dispatchEvent(new Event('openNotificationDropdown'))}
          className="text-sm text-gray-600 hover:text-black cursor-pointer shrink-0 transition-all duration-200 flex items-center gap-1"
        >
          View All →
        </button>
      </div>

      <div className="space-y-4 flex-1 flex flex-col px-2">
        {loading ? (
          [1, 2, 3].map(key => (
            <div key={key} className="flex items-center justify-between">
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
          <div className="flex flex-col items-center justify-center py-6 text-center flex-1">
            <p className="text-gray-500 text-sm p-4">📭 No notifications</p>
          </div>
        ) : (
          notifications.map((notif, idx) => {
            const boxColors = getBoxColors(notif.notification_type);
            return (
              <div 
                key={idx} 
                onClick={() => handleNotificationClick(notif.notification_type)}
                className="group flex items-center justify-between p-3 rounded-xl bg-white border border-transparent hover:border-gray-100 shadow-sm hover:-translate-y-[2px] hover:shadow-md transition-all duration-300 cursor-pointer mb-2"
              >
                <div className="flex items-start gap-4 w-full">
                  <div className={`w-6 h-8 min-w-12 rounded-lg ${boxColors.outer} flex items-center justify-center shrink-0`}>
                    <div className={`w-4 h-4 ${boxColors.inner} rounded-sm`}></div>
                  </div>

                  <div className="flex-1 overflow-hidden min-w-0">
                    <p className={`text-sm truncate ${notif.read ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'}`}>
                      {notif.title || "Notification"}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                      {notif.message || "No message"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                     <span className="text-[10px] text-gray-400">
                        {formatRelativeTime(notif.created_at)}
                      </span>
                     <ChevronRight size={18} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 mt-1" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}