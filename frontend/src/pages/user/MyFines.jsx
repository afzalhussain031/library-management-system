import React from 'react';

const MyFines = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Fines</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">You currently have no fines.</p>
      </div>
    </div>
  );
};

export default MyFines;
