export default function Notifications() {
  return (
    <div className="bg-white p-2 rounded-3xl shadow-md border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer">
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>

        <button className="text-sm text-gray-600 hover:text-black flex items-center gap-1">
          View All →
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-5">
        {/* 🔴 First Notification */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            {/* Pink Dummy Icon */}
            <div className="w-6 h-8 min-w-12 rounded-lg bg-pink-200 flex items-center justify-center">
              <div className="w-4 h-4 bg-pink-400 rounded-sm"></div>
            </div>

            {/* Text */}
            <div>
              <p className="font-semibold text-gray-900">Fine pending</p>
              <p className="text-sm text-gray-500">₹ 50 pending</p>
            </div>

            <span className="text-gray-400 text-lg cursor-pointer">›</span>
          </div>

          {/* Pay Button */}
          {/* <button className="bg-yellow-400 hover:bg-yellow-500 px-5 py-2 rounded-full text-sm font-medium text-gray-900 flex items-center justify-between p-2 transition cursor-pointer hover:scale-[1.01]">
            Pay Now qwwertyuiopasdfghjklzxcvbnm
          </button> */}
        </div>

        {/* 🟡 Notification 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            {/* Yellow Dummy Icon */}
            <div className="w-6 h-8 min-w-12 rounded-lg bg-yellow-200 flex items-center justify-center">
              <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
            </div>

            {/* Text */}
            <div>
              <p className="font-extrasmall text-gray-900">
                Atomic Habits is due tomorrow
              </p>
              <p className="text-sm text-gray-500">1 hour ago · 00 Nov 2022</p>
            </div>
          </div>
            <button className="text-gray-400 text-lg cursor-pointer">
          <span>›</span>
          </button>
        </div>

        {/* 🟢 Notification 3 */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            {/* Green Dummy Icon */}
            <div className="w-6 h-8 min-w-12 rounded-lg bg-green-200 flex items-center justify-center">
              <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
            </div>

            {/* Text */}
            <div>
              <p className="font-extrasmall text-gray-900">
                New books have been added to Science category
              </p>
              <p className="text-sm text-gray-500">4 hours · 15 Nov 2022</p>
            </div>
          </div>

          <span className="text-gray-400 text-lg cursor-pointer">›</span>
        </div>

        {/* 🟣 Notification 4 */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            {/* Purple Dummy Icon */}
            <div className="w-6 h-8 min-w-12 rounded-lg bg-purple-200 flex items-center justify-center">
              <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
            </div>

            {/* Text */}
            <div>
              <p className="font-extrasmall text-gray-900">
                Your reserved book "Machine Learning Basics" is now available
                fr...
              </p>
              <p className="text-sm text-gray-500">1 day ago · 29 Nov 2022</p>
            </div>
          </div>

          <span className="text-gray-400 text-lg cursor-pointer">›</span>
        </div>
      </div>
    </div>
  );
}
