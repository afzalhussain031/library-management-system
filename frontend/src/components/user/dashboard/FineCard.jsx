import { useState, useEffect } from "react";
import { dashboard } from "../../../services/api";

export default function FineCard() {
  const [fines, setFines] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFines() {
      try {
        const response = await dashboard.getFines();
        const finesList = Array.isArray(response) ? response : response.results || [];
        
        // Get pending fines only
        const pendingFines = finesList.filter(fine => fine.status === "pending");
        const totalAmount = pendingFines.reduce((sum, fine) => sum + (fine.amount || 0), 0);
        
        setFines({
          total: totalAmount,
          count: pendingFines.length,
          list: pendingFines
        });
      } catch (err) {
        console.error("Failed to fetch fines:", err);
        setFines({ total: 0, count: 0, list: [] });
      } finally {
        setLoading(false);
      }
    }

    fetchFines();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-4xl shadow-md border border-gray-100 flex items-center justify-center h-32">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const amount = fines?.total || 0;

  return (
    <div className="bg-white p-6 rounded-4xl shadow-md border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Fines Pending</h2>
        <button className="text-sm text-gray-600 hover:text-black cursor-pointer shrink-0 transition-all duration-200 flex items-center gap-1">
          View All →
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-12 bg-pink-200 rounded-xl flex items-center justify-center text-gray-600 font-medium">
            ₹
          </div>

          <div>
            <h1 className="text-3xl font-semibold text-gray-900 py-5">₹ {Math.round(amount)}</h1>

            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <span className="text-yellow-500 text-lg">👤</span>
              <div>
                <p className="text-sm font-medium text-gray-800">Pay Fine</p>
                <p className="text-sm text-gray-500">{fines?.count || 0} pending</p>
              </div>
            </div>
          </div>
        </div>

        <button className="bg-yellow-400 px-4 py-2 rounded-full text-sm text-black font-medium hover:bg-yellow-500 transition hover:scale-[1.01] cursor-pointer">
          Pay Now
        </button>
      </div>
    </div>
  );
}