import { useAuth } from "../../context/AuthContext";
import { profile, dashboard } from "../../services/api";
import { useApi } from "../../hook/useApi";
import ErrorMessage from "../../components/common/ErrorMessage";

import ProfileCard from "../../components/user/profile/ProfileCard";
import InfoSection from "../../components/user/profile/InfoSection";
import BookHistory from "../../components/user/profile/BookHistory";

export default function UserProfile() {
  const { currentUser } = useAuth(); // Get current user from context
  const { data: profileData, isLoading: loading, error } = useApi(profile.get, null);
  const { data: statsData, isLoading: statsLoading, error: statsError } = useApi(dashboard.getStats, null);

  if (error || statsError) return <ErrorMessage message={error || statsError} />;
  
  const safeProfile = profileData || {};

  return (
    <div className="bg-linear-to-r from-gray-100 to-yellow-100 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="lg:col-span-1 space-y-4">

          <ProfileCard userData={safeProfile} isLoading={loading} />

          <InfoSection
            title="Account Information"
            data={[
              ["Enrollment ID", safeProfile.user_id || "N/A"],
              ["Email", safeProfile.email || "N/A"],
              ["Phone", safeProfile.phone_number || "N/A"],
              ["Year of Study", safeProfile.batch || "N/A"],
            ]}
            isLoading={loading}
          />

          <InfoSection
            title="Academic Details"
            data={[
              ["Course", safeProfile.department || "N/A"],
              ["Semester", safeProfile.batch || "N/A"],
              ["Section", safeProfile.father_name || "N/A"],
              ["Attendance", safeProfile.mother_name || "N/A"],
            ]}
            isLoading={loading}
          />

          <InfoSection
            title="Library Information"
            data={[
              ["Books Currently Borrowed", statsData?.library_information?.currently_borrowed != null ? `${statsData.library_information.currently_borrowed} Books` : "N/A"],
              ["Total Borrowed", statsData?.library_information?.total_borrowed != null ? `${statsData.library_information.total_borrowed} Books` : "N/A"],
              ["Membership ID", safeProfile.user_id ? `LIB-${safeProfile.user_id}` : "N/A"],
              ["Valid Till", statsData?.library_information?.membership_valid_till ? new Date(statsData.library_information.membership_valid_till).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A"],
            ]}
            fine={statsData?.library_information?.pending_fines || 0}
            isLoading={loading || statsLoading}
          />

        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-2">
          <BookHistory isLoading={loading || statsLoading} />
        </div>

      </div>
    </div>
  );
}