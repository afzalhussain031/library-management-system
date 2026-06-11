import { useState } from "react";

export default function BookHistory() {

  const [activeTab, setActiveTab] = useState("borrowed");

  const books = Array(8).fill({
    title: "A Brief History o..",
    author: "by Stephen Hawk..",
    id: "#423532",
    date: "12-Dec-22",
  });

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
          books.map((book, i) => (
            <div
              key={i}
              className="flex items-start justify-between border-b border-gray-100 pb-4"
            >

              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {book.title}
                </p>

                <p className="text-xs text-gray-500">
                  {book.author}
                </p>

                <p className="text-[10px] text-gray-400 mt-1">
                  {book.id}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-gray-400">
                  Borrowed on
                </p>

                <p className="text-xs font-semibold text-gray-900 mt-1">
                  {book.date}
                </p>
              </div>

            </div>
          ))}

        {/* 🟢 RETURNED */}
        {activeTab === "returned" &&
          books.map((book, i) => (
            <div
              key={i}
              className="flex items-start justify-between border-b border-gray-100 pb-4"
            >

              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {book.title}
                </p>

                <p className="text-xs text-gray-500">
                  {book.author}
                </p>

                <p className="text-[10px] text-gray-400 mt-1">
                  {book.id}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-gray-400">
                  Returned on
                </p>

                <p className="text-xs font-semibold text-gray-900 mt-1">
                  {book.date}
                </p>
              </div>

            </div>
          ))}

        {/* 🔴 FINES */}
        {activeTab === "fines" &&
          books.map((book, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-gray-100 pb-4"
            >

              {/* Left */}
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {book.title}
                </p>

                <p className="text-xs text-gray-500">
                  {book.author}
                </p>

                <p className="text-[10px] text-gray-400 mt-1">
                  {book.id}
                </p>
              </div>

              {/* Middle */}
              <div className="text-center">
                <p className="text-[10px] text-gray-400">
                  Due on
                </p>

                <p className="text-xs font-semibold text-red-500 mt-1">
                  12-Dec-22
                </p>
              </div>

              {/* Fine */}
              <div className="text-center">
                <p className="text-[10px] text-gray-400">
                  Fine
                </p>

                <p className="text-xs font-semibold text-red-500 mt-1">
                  ₹ 40
                </p>
              </div>

              {/* Button */}
              <button className="bg-yellow-400 hover:bg-yellow-500 transition px-4 py-1 rounded-full text-xs font-medium text-gray-900">
                Pay Now
              </button>

            </div>
          ))}

      </div>

      {/* Bottom */}
      <div className="flex flex-col items-center mt-6 gap-3">

        {activeTab === "fines" && (
          <button className="bg-yellow-400 hover:bg-yellow-500 transition px-5 py-1.5 rounded-full text-sm font-medium text-gray-900">
            Pay All
          </button>
        )}

        <button className="bg-yellow-100 hover:bg-yellow-200 transition px-4 py-1.5 rounded-full text-sm text-gray-700">
          1-25 of 21 →
        </button>

      </div>

    </div>
  );
}