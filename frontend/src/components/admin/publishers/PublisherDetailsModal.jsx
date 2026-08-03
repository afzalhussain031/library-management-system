import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PublisherDetailsModal = ({ publisherId, onClose }) => {
  const [publisher, setPublisher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("PublisherDetailsModal mounted with publisherId:", publisherId, "type:", typeof publisherId);
    if (!publisherId) return;

    const fetchPublisherDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/publishers/${publisherId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setPublisher(response.data);
      } catch (error) {
        toast.error("Failed to fetch publisher details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublisherDetails();
  }, [publisherId]);

  if (!publisherId) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-[600px] bg-white rounded-[32px] shadow-2xl border border-white/50 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0px 24px 60px -10px rgba(0, 0, 0, 0.12)' }}
      >
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-amber-50/40 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <button 
          onClick={onClose} 
          className="absolute top-6 right-8 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 shadow-sm transition-all active:scale-95 z-10"
        >
          <X size={16} strokeWidth={3} />
        </button>

        <h2 className="text-xl font-extrabold text-[#1C2434] tracking-tight mb-2">Publisher Details</h2>

        <div className="bg-[#FDFBF7] border border-amber-100/20 rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
          {loading ? (
            <div className="animate-pulse flex flex-col gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
            </div>
          ) : publisher ? (
            <>
              <div>
                <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Name</p>
                <p className="text-[15px] font-black text-[#1C2434] mt-0.5">{publisher.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Address</p>
                <p className="text-[13px] font-extrabold text-[#334155] mt-0.5">
                  {publisher.address || <span className="text-gray-400 italic font-medium">Not Set</span>}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-4">Publisher not found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublisherDetailsModal;
