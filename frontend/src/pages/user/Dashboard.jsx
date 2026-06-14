import StatCard from "../../components/Dashboard/StatCard";
import BorrowedList from "../../components/Dashboard/BorrowedList";
import Notifications from "../../components/Dashboard/Notifications";
import Recommended from "../../components/Dashboard/Recommended";
import FineCard from "../../components/Dashboard/FineCard";
import { useState, useEffect } from "react";
import { getDashboard } from "../../services/api";
import { Pause,Wallet,Mail, Heart } from "lucide-react";


export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const data = await getDashboard()
        setDashboardData(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>

  const libInfo = dashboardData?.library_information || {}

  return (
    <div className="p-6 bg-linear-to-r from-gray-100 to-yellow-100 min-h-screen">

      {/* Top Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">        
    <StatCard title="Borrowed" value={libInfo.currently_borrowed || 0} color="bg-blue-100" icon = {<Pause strokeWidth={1.5} />} />
        <StatCard title="Due Soon" value="32" color="bg-yellow-100"  icon={<Wallet strokeWidth={1.5} />}/>
        <StatCard title="Total Fine" value={`₹${libInfo.pending_fines || 0}`} color="bg-pink-100" icon={<Mail strokeWidth={1.5} />} />
        <StatCard title="Wishlist" value="7" color="bg-green-100" icon={<Heart strokeWidth={1.5} />} />
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