import profileImg from "../../../assets/profile.jpg";
export default function ProfileCard({ userData }) {

  const userName = userData?.student_name || userData?.first_name || "User";
  const department = userData?.department || "Department";
  const role = userData?.role || "student";

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 relative mx-2">

      {/* Print Icon */}
      <div className="absolute top-4 right-4 text-gray-500 cursor-pointer">
        🖨
      </div>

      <div className="flex flex-col items-center">

        {/* Profile Image */}
        <img
          src={profileImg}
          alt="profile"
          className="w-20 h-20 rounded-full border-4 border-yellow-400"
        />

        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          {userName}
        </h2>

        <p className="text-sm text-gray-500">
          {role} • {department}
        </p>

        <button className="mt-4 bg-yellow-400 px-4 py-1.5 rounded-full text-sm font-medium text-gray-900 contrast-more:text-black cursor-pointer transition hover:bg-gray-10 hover:scale-[1.01]">
          Active Member
        </button>

      </div>
    </div>
  );
}