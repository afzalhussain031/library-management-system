import { ArrowRight } from "lucide-react";

export default function FineCard() {
  return (
    <div className="bg-white p-6 rounded-4xl shadow-md border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Fines Pending</h2>

        <button className="text-sm text-gray-600 hover:text-black cursor-pointer shrink-0 transition-all  duration-200  flex items-center gap-1 ">
          View All
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Icon Box */}
          <div className="w-14 h-12 bg-pink-200 rounded-xl flex items-center justify-center text-gray-600 font-medium py-2 px-3 -mt-7.5 ">
            w:h
          </div>

          {/* Amount + Info */}
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 py-5">₹ 50</h1>

            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <span className="text-yellow-500 text-lg">👤</span>
              <div>
                <p className="text-sm font-medium text-gray-800 ">Pay Fine</p>
                <p className="text-sm text-gray-500">₹ 30</p>
              </div>
            </div>
          </div>
        </div>
        {/* Pay Button */}
            <button className="bg-yellow-400 px-4 py-2 rounded-full text-sm mt-1 text-black font-medium hover:bg-yellow-500 transition hover:scale-[1.01] cursor-pointer">
          Pay Now
        </button>
      </div>
    </div>
  );
}
