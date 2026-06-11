import ProfileCard from "../../components/Profile/ProfileCard";
import InfoSection from "../../components/Profile/InfoSection";
import BookHistory from "../../components/Profile/BookHistory";

export default function UserProfile() {
  return (
    <div className="bg-linear-to-r from-gray-100 to-yellow-100 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="lg:col-span-1 space-y-4">

          <ProfileCard />

          <InfoSection
            title="Account Information"
            data={[
              ["Enrollment ID", "ENR-2023-0456"],
              ["Email", "johnstone@college.edu"],
              ["Phone", "9876543210"],
              ["Year of Study", "3rd Year"],
            ]}
          />

          <InfoSection
            title="Academic Details"
            data={[
              ["Course", "B.Tech Computer Science"],
              ["Semester", "6th Semester"],
              ["Section", "A"],
              ["Attendance", "87%"],
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