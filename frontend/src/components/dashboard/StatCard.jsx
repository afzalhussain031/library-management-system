export default function StatCard({ icon ,title, value,  }) {
  return (
    <div className="bg-white p-4 rounded-4xl shadow-md flex items-center">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-xl text-xl">
        {icon}
      </div>
      <div className="flex flex-col gap-1">

        <p className="text-gray-600 text-sm font-medium ">{title}</p>
        <h2 className="text-xl font-semibold text-gray-900 ">
          
          {value}
        </h2>
        </div>
      </div>

      
    </div>
  );
}