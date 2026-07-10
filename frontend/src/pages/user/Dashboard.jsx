import StatCard from "../../components/user/dashboard/StatCard";
import BorrowedList from "../../components/user/dashboard/BorrowedList";
import Notifications from "../../components/user/dashboard/Notifications";
import Recommended from "../../components/user/dashboard/Recommended";
import FineCard from "../../components/user/dashboard/FineCard";
import { dashboard } from "../../services/api";
import { useApi } from "../../hook/useApi";
import ErrorMessage from "../../components/common/ErrorMessage";
import { Pause,Wallet,Mail, Heart } from "lucide-react";


export default function Dashboard() {
  const { data: dashboardData, isLoading: loading, error } = useApi(dashboard.getStats, null);

  if (error) return <div className="p-6"><ErrorMessage message={error} /></div>

  const libInfo = dashboardData?.library_information || {}

  return (
    <div className="p-6 bg-linear-to-r from-gray-100 to-yellow-100 min-h-screen">

      {/* Top Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">        
    <StatCard title="Borrowed" value={libInfo.currently_borrowed || 0} color="bg-blue-100" icon = {<Pause strokeWidth={1.5} />} isLoading={loading} />
        <StatCard title="Due Soon" value="32" color="bg-yellow-100"  icon={<Wallet strokeWidth={1.5} />} isLoading={loading} />
        <StatCard title="Total Fine" value={`₹${libInfo.pending_fines || 0}`} color="bg-pink-100" icon={<Mail strokeWidth={1.5} />} isLoading={loading} />
        <StatCard title="Wishlist" value="7" color="bg-green-100" icon={<Heart strokeWidth={1.5} />} isLoading={loading} />
      </div>

      {/* Middle Section */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">        
    <div className="col-span-2">
          <BorrowedList />
        </div>

        <Notifications />
      </div>

      {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
            <div className="col-span-2">
          <Recommended />
        </div>

        <FineCard />
      </div>

    </div>
  );
}