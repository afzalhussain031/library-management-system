import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { profile } from "../../services/api";

import ProfileCard from "../../components/Profile/ProfileCard";
import InfoSection from "../../components/Profile/InfoSection";
import BookHistory from "../../components/Profile/BookHistory";

export default function UserProfile() {
  const { currentUser } = useAuth(); // Get current user from context
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile data from backend
  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await profile.get();
        setProfileData(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  if (loading) return <div>Loading...</div>;
  if (!profileData) return <div>No profile Data found</div>

  return (
    <div className="bg-linear-to-r from-gray-100 to-yellow-100 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="lg:col-span-1 space-y-4">

          <ProfileCard userData={profileData}/>

          <InfoSection
            title="Account Information"
            data={[
              ["Enrollment ID", profileData.enrollment_number || "N/A"],
              ["Email", profileData.email || "N/A"],
              ["Phone", profileData.phone_number || "N/A"],
              ["Year of Study", profileData.batch || "N/A"],
            ]}
          />

          <InfoSection
            title="Academic Details"
            data={[
              ["Course", profileData.student_id || "N/A"],
              ["Semester", profileData.department || "N/A"],
              ["Section", profileData.father_name || "N/A"],
              ["Attendance", profileData.mother_name || "N/A"],
            ]}
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
          />

        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-2">
          <BookHistory />
        </div>

      </div>
    </div>
  );
}