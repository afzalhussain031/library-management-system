import React from "react";
import StatCard from "../../components/user/dashboard/StatCard";
import {
  Building2,
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  QuickActions,
  AlertsPanel,
  TopRequestedCategories,
  TaskStatus,
  RecentActivity,
} from "../../components/superadmin/SuperadminWidgets";
import BranchPerformanceChart from "../../components/superadmin/BranchPerformanceChart";
import TopLibrariesTable from "../../components/superadmin/TopLibrariesTable";
import SubscriptionStatus from "../../components/superadmin/SubscriptionStatus";

const SuperDashboard = () => {
  return (
    <div className="relative px-0 py-4 sm:p-6 md:p-8 space-y-6 w-full max-w-[1600px] mx-auto font-sans min-h-screen overflow-hidden">
      {/* Subtle warm gradient background wash */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-gray-100/50 to-transparent -z-10 opacity-60" />

      {/* Stats Row */}
      <div
        className="rounded-[28px] p-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(248,248,252,0.88) 100%)",
          boxShadow:
            "0 4px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.8) inset",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3">
          <StatCard
            title="Libraries"
            value="24"
            icon={Building2}
            bgColor="#EAF2FF"
            iconBgColor="#3D7EF0"
          />
          <StatCard
            title="Users"
            value="18,420"
            icon={Users}
            bgColor="#FFF3DC"
            iconBgColor="#F5A623"
          />
          <StatCard
            title="Books"
            value="210,560"
            icon={BookOpen}
            bgColor="#EEE8FF"
            iconBgColor="#7C4DFF"
          />
          <StatCard
            title="Revenue"
            value="₹2.4L"
            icon={TrendingUp}
            bgColor="#FFF0E0"
            iconBgColor="#F5A623"
          />
          <StatCard
            title="Alerts"
            value="4"
            subtitle="Active alerts"
            icon={AlertCircle}
            bgColor="#FFE8E8"
            iconBgColor="#E53935"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="w-full min-w-0">
        <QuickActions />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(320px,35%)] gap-6 mt-6">
        <div className="space-y-6 min-w-0">
          <BranchPerformanceChart />
          <TopLibrariesTable />
          <SubscriptionStatus />
        </div>
        <div className="space-y-6 min-w-0">
          <AlertsPanel />
          <TopRequestedCategories />
          <TaskStatus />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default SuperDashboard;
