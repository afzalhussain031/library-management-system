export default function InfoSection({ title, data, fine }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mx-2">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 ">{title}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        {data.map(([label, value], i) => (
          <div key={i} className="min-w-0">
            <p className="text-xs text-gray-500 mb-1">{label}</p>

            <p className="text-sm font-medium text-gray-900 break-all">
              {value}
            </p>
          </div>
        ))}
      </div>

      {fine && (
        <button className="mt-5 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-sm font-medium h-full">
          ₹450 Pending Fine
        </button>
      )}
    </div>
  );
}
