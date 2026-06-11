import React from 'react';
import { ChevronRight } from 'lucide-react';

const TopLibrariesTable = () => {
  const libraries = [
    { id: 1, name: 'Main Campus', users: 4500, books: '80k', requests: '-', status: 'Active' },
    { id: 2, name: 'Medical Branch', users: 2300, books: '2.5k', requests: '-', status: 'Active' },
    { id: 3, name: 'Engineering', users: 3400, books: '50k', requests: '-', status: 'Active' },
    { id: 4, name: 'Research Library', users: 3400, books: '50k', requests: '-', status: 'Active' },
    { id: 5, name: 'QA Library', users: 2700, books: '120k', requests: '-', status: 'Active', isQa: true },
  ];

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 text-lg">Top Libraries</h3>
        <button className="text-[#4386F5] text-sm font-bold flex items-center gap-1 hover:underline">
          View All <ChevronRight size={16} />
        </button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm border-separate" style={{ borderSpacing: '0 8px' }}>
          <thead>
            <tr className="text-gray-400 text-xs uppercase tracking-wider font-bold">
              <th className="px-4 py-2 font-bold">Branch</th>
              <th className="px-4 py-2 font-bold">Users</th>
              <th className="px-4 py-2 font-bold">Books</th>
              <th className="px-4 py-2 font-bold">Requests</th>
              <th className="px-4 py-2 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {libraries.map((lib) => (
              <tr key={lib.id} className="bg-[#F9FAFB] rounded-xl overflow-hidden group hover:bg-[#F3F4F6] transition-colors">
                <td className="px-4 py-3 first:rounded-l-xl flex items-center gap-2 font-medium text-gray-700">
                  <div className={`w-4 h-4 rounded-full border-[2px] bg-transparent ${lib.isQa ? 'border-[#4386F5]' : 'border-gray-300'}`}></div>
                  {lib.name}
                </td>
                <td className="px-4 py-3 text-gray-600 font-medium">{lib.users}</td>
                <td className="px-4 py-3 text-gray-600 font-medium">{lib.books}</td>
                <td className="px-4 py-3 text-gray-400 font-medium">{lib.requests}</td>
                <td className="px-4 py-3 last:rounded-r-xl">
                  <span className="px-3 py-1 bg-[#C9F7F5] text-[#1BC5BD] rounded-full text-[10px] font-black uppercase tracking-wider">
                    {lib.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopLibrariesTable;
