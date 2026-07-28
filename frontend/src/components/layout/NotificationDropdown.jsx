import { useState, useEffect, useRef } from "react";
import { Bell, X } from "lucide-react";
import { dashboard } from "../../services/api";
import { useApi } from "../../hook/useApi";
import { SkeletonAvatar, SkeletonText } from "../common/Skeleton";
import { toast } from "react-hot-toast";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { data, isLoading: loading, error } = useApi(dashboard.getNotifications, []);
  
  const [localNotifications, setLocalNotifications] = useState([]);

  // Sync api data to local state when loaded
  useEffect(() => {
    if (data) {
      const notifList = Array.isArray(data) ? data : data?.results || [];
      setLocalNotifications(notifList);
    }
  }, [data]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen for custom event from dashboard
  useEffect(() => {
    const handleOpenNotification = () => {
      setIsOpen(true);
      // Scroll to top to ensure user sees it
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    document.addEventListener("openNotificationDropdown", handleOpenNotification);
    return () => document.removeEventListener("openNotificationDropdown", handleOpenNotification);
  }, []);

  const handleRemoveNotification = async (e, indexToRemove, notifId) => {
    e.stopPropagation(); // prevent closing if clicking inside
    try {
      if (notifId) {
        await dashboard.markNotificationRead(notifId);
      }
      setLocalNotifications(prev => prev.filter((_, idx) => idx !== indexToRemove));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
      toast.error("Failed to dismiss notification");
    }
  };

  const unreadCount = localNotifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {error ? (
              <div className="p-4 text-center text-red-500 text-sm">Failed to load notifications.</div>
            ) : loading ? (
              [1, 2, 3].map(key => (
                <div key={key} className="flex items-start gap-3 p-3">
                  <SkeletonAvatar className="w-10 h-10 rounded-lg" />
                  <div className="space-y-2 flex-1 mt-1">
                    <SkeletonText className="h-4 w-3/4" />
                    <SkeletonText className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : localNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <Bell size={32} className="text-gray-300 mb-2" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              localNotifications.map((notif, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 min-w-10 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
                      <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                    </div>

                    <div>
                      <p className="font-medium text-gray-900 text-sm">{notif.title || "Notification"}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message || "No message"}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => handleRemoveNotification(e, idx, notif.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
          
          {localNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={() => {
                  localNotifications.forEach(notif => {
                    if (notif.id) dashboard.markNotificationRead(notif.id).catch(() => {});
                  });
                  setLocalNotifications([]);
                }}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
