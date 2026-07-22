import { useState } from "react";
import { SkeletonText } from "../../common/Skeleton";
import { useApi } from "../../../hook/useApi";
import { dashboard } from "../../../services/api";

export default function BookHistory({ isLoading: parentLoading }) {
  const [activeTab, setActiveTab] = useState("borrowed");

  const { data: loansData, isLoading: loansLoading } = useApi(dashboard.getBorrowedBooks, null);
  const { data: finesData, isLoading: finesLoading } = useApi(dashboard.getFines, null);

  const isLoading = parentLoading || loansLoading || finesLoading;

  const loans = loansData || [];
  const borrowedLoans = loans.filter(loan => !loan.returned_at);
  const returnedLoans = loans.filter(loan => loan.returned_at);
  
  // Filter out paid fines, keeping only pending
  const fines = (finesData || []).filter(fine => fine.status === "pending" || fine.status === "unpaid");

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 h-full flex flex-col">

      {/* Tabs */}
<div className="flex flex-wrap gap-2 sm:gap-3 mb-6">

  <button
    onClick={() => setActiveTab("borrowed")}
    className={`flex-1 sm:flex-none min-w-22.5 px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition
    ${
      activeTab === "borrowed"
        ? "bg-black text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    Borrowed
  </button>

  <button
    onClick={() => setActiveTab("returned")}
    className={`flex-1 sm:flex-none min-w-22.5 px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition
    ${
      activeTab === "returned"
        ? "bg-black text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    Returned
  </button>

  <button
    onClick={() => setActiveTab("fines")}
    className={`flex-1 sm:flex-none min-w-22.5 px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition
    ${
      activeTab === "fines"
        ? "bg-black text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    Fines
  </button>

</div>






      {/* Tabs */}
      {/* <div className="flex gap-3 mb-6">

        <button
          onClick={() => setActiveTab("borrowed")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition
          ${
            activeTab === "borrowed"
              ? "bg-black text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Borrowed
        </button>

        <button
          onClick={() => setActiveTab("returned")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition
          ${
            activeTab === "returned"
              ? "bg-black text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Returned
        </button>

        <button
          onClick={() => setActiveTab("fines")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition
          ${
            activeTab === "fines"
              ? "bg-black text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Fines
        </button>

      </div> */}


















      {/* CONTENT */}
      <div className="flex-1 space-y-5">

        {/* 🔵 BORROWED */}
        {activeTab === "borrowed" &&
          (isLoading ? (
            [1, 2, 3, 4].map(key => (
              <div key={key} className="flex items-start justify-between border-b border-gray-100 pb-4">
                <div className="space-y-2">
                  <SkeletonText className="h-4 w-32" />
                  <SkeletonText className="h-3 w-24" />
                  <SkeletonText className="h-2 w-16" />
                </div>
                <div className="text-right space-y-2 flex flex-col items-end">
                  <SkeletonText className="h-2 w-16" />
                  <SkeletonText className="h-3 w-20" />
                </div>
              </div>
            ))
          ) : borrowedLoans.length === 0 ? (
            <div className="text-center text-gray-500 py-4 text-sm">No borrowed books</div>
          ) : borrowedLoans.map((loan, i) => (
            <div
              key={loan.id || i}
              className="flex items-start justify-between border-b border-gray-100 pb-4"
            >

              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {loan.book_title}
                </p>

                <p className="text-xs text-gray-500">
                  {loan.book_author}
                </p>

                <p className="text-[10px] text-gray-400 mt-1">
                  #{loan.book_id}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-gray-400">
                  Borrowed on
                </p>

                <p className="text-xs font-semibold text-gray-900 mt-1">
                  {formatDate(loan.issued_at)}
                </p>
              </div>

            </div>
          )))}

        {/* 🟢 RETURNED */}
        {activeTab === "returned" &&
          (isLoading ? (
            [1, 2, 3, 4].map(key => (
              <div key={key} className="flex items-start justify-between border-b border-gray-100 pb-4">
                <div className="space-y-2">
                  <SkeletonText className="h-4 w-32" />
                  <SkeletonText className="h-3 w-24" />
                  <SkeletonText className="h-2 w-16" />
                </div>
                <div className="text-right space-y-2 flex flex-col items-end">
                  <SkeletonText className="h-2 w-16" />
                  <SkeletonText className="h-3 w-20" />
                </div>
              </div>
            ))
          ) : returnedLoans.length === 0 ? (
            <div className="text-center text-gray-500 py-4 text-sm">No returned books</div>
          ) : returnedLoans.map((loan, i) => (
            <div
              key={loan.id || i}
              className="flex items-start justify-between border-b border-gray-100 pb-4"
            >

              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {loan.book_title}
                </p>

                <p className="text-xs text-gray-500">
                  {loan.book_author}
                </p>

                <p className="text-[10px] text-gray-400 mt-1">
                  #{loan.book_id}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-gray-400">
                  Returned on
                </p>

                <p className="text-xs font-semibold text-gray-900 mt-1">
                  {formatDate(loan.returned_at)}
                </p>
              </div>

            </div>
          )))}

        {/* 🔴 FINES */}
        {activeTab === "fines" &&
          (isLoading ? (
            [1, 2, 3, 4].map(key => (
              <div key={key} className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="space-y-2">
                  <SkeletonText className="h-4 w-32" />
                  <SkeletonText className="h-3 w-24" />
                  <SkeletonText className="h-2 w-16" />
                </div>
                <div className="text-center space-y-2 flex flex-col items-center">
                  <SkeletonText className="h-2 w-12" />
                  <SkeletonText className="h-3 w-16" />
                </div>
                <div className="text-center space-y-2 flex flex-col items-center">
                  <SkeletonText className="h-2 w-12" />
                  <SkeletonText className="h-3 w-12" />
                </div>
                <SkeletonText className="h-6 w-16 rounded-full" />
              </div>
            ))
          ) : fines.length === 0 ? (
            <div className="text-center text-gray-500 py-4 text-sm">No pending fines</div>
          ) : fines.map((fine, i) => (
            <div
              key={fine.id || i}
              className="flex items-center justify-between border-b border-gray-100 pb-4"
            >

              {/* Left */}
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {fine.loan_book_title || "Unknown Book"}
                </p>

                <p className="text-xs text-gray-500">
                  {fine.loan_book_author || "Unknown Author"}
                </p>

                <p className="text-[10px] text-gray-400 mt-1">
                  #{fine.loan_copy_barcode || "N/A"}
                </p>
              </div>

              {/* Middle */}
              <div className="text-center">
                <p className="text-[10px] text-gray-400">
                  Due on
                </p>

                <p className="text-xs font-semibold text-red-500 mt-1">
                  {formatDate(fine.loan_due_at)}
                </p>
              </div>

              {/* Fine */}
              <div className="text-center">
                <p className="text-[10px] text-gray-400">
                  Fine
                </p>

                <p className="text-xs font-semibold text-red-500 mt-1">
                  ₹ {fine.amount}
                </p>
              </div>

              {/* Button */}
              <button className="bg-yellow-400 hover:bg-yellow-500 transition px-4 py-1 rounded-full text-xs font-medium text-gray-900">
                Pay Now
              </button>

            </div>
          )))}

      </div>

      {/* Bottom */}
      <div className="flex flex-col items-center mt-6 gap-3">

        {activeTab === "fines" && (
          <button className="bg-yellow-400 hover:bg-yellow-500 transition px-5 py-1.5 rounded-full text-sm font-medium text-gray-900">
            Pay All
          </button>
        )}

        <button className="bg-yellow-100 hover:bg-yellow-200 transition px-4 py-1.5 rounded-full text-sm text-gray-700 hidden">
          1-25 of 21 →
        </button>

      </div>

    </div>
  );
}