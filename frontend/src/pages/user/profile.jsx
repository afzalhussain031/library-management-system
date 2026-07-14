import { useAuth } from "../../context/AuthContext";
import { profile } from "../../services/api";
import { useApi } from "../../hook/useApi";
import ErrorMessage from "../../components/common/ErrorMessage";

import ProfileCard from "../../components/user/profile/ProfileCard";
import InfoSection from "../../components/user/profile/InfoSection";
import BookHistory from "../../components/user/profile/BookHistory";

export default function UserProfile() {
  const { currentUser } = useAuth(); // Get current user from context
  const { data: profileData, isLoading: loading, error } = useApi(profile.get, null);

  if (error) return <ErrorMessage message={error} />;
  
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
              ["Books Currently Borrowed", "3 Books"],
              ["Total Borrowed", "18 Books"],
              ["Membership ID", "LIB-009876"],
              ["Valid Till", "31 Dec 2026"],
            ]}
            fine={true}
            isLoading={loading}
          />

        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-2">
          <BookHistory isLoading={loading} />
        </div>

      </div>
    </div>
  );
}