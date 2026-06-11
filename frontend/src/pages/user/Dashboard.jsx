import StatCard from "../../components/Dashboard/StatCard";
import BorrowedList from "../../components/Dashboard/BorrowedList";
import Notifications from "../../components/Dashboard/Notifications";
import Recommended from "../../components/Dashboard/Recommended";
import FineCard from "../../components/Dashboard/FineCard";
import { Pause,Wallet,Mail, Heart } from "lucide-react";


export default function Dashboard() {
  return (
    <div className="p-6 bg-linear-to-r from-gray-100 to-yellow-100 min-h-screen">

      {/* Top Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">        
    <StatCard title="Borrowed" value="10" color="bg-blue-100" icon = {<Pause strokeWidth={1.5} />} />
        <StatCard title="Due Soon" value="32" color="bg-yellow-100"  icon={<Wallet strokeWidth={1.5} />}/>
        <StatCard title="Total Fine" value="₹120" color="bg-pink-100" icon={<Mail strokeWidth={1.5} />} />
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