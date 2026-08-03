import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const BookDetailsModal = ({ bookId, onClose }) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("BookDetailsModal mounted with bookId:", bookId, "type:", typeof bookId);
    if (!bookId) return;

    const fetchBookDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/books/${bookId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setBook(response.data);
      } catch (error) {
        toast.error("Failed to fetch book details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  if (!bookId) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-[800px] max-h-[90vh] bg-white rounded-[32px] shadow-2xl border border-white/50 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar"
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

        <h2 className="text-xl font-extrabold text-[#1C2434] tracking-tight mb-2">Book Details</h2>

        <div className="bg-[#FDFBF7] border border-amber-100/20 rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
          {loading ? (
            <div className="animate-pulse flex flex-col gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
            </div>
          ) : book ? (
            <div className="flex flex-col md:flex-row gap-6">
              {book.cover_image && (
                <div className="shrink-0 w-32 h-48 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                  <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                <div className="md:col-span-2">
                  <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Title</p>
                  <p className="text-[15px] font-black text-[#1C2434] mt-0.5">{book.title}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Author</p>
                  <p className="text-[13px] font-extrabold text-[#334155] mt-0.5">{book.author || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">ISBN</p>
                  <p className="text-[13px] font-extrabold text-[#334155] mt-0.5">{book.isbn}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Publisher</p>
                  <p className="text-[13px] font-extrabold text-[#334155] mt-0.5">{book.publisher?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Category</p>
                  <p className="text-[13px] font-extrabold text-[#334155] mt-0.5">{book.category?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Language</p>
                  <p className="text-[13px] font-extrabold text-[#334155] mt-0.5">{book.language?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Availability</p>
                  <p className="text-[13px] font-extrabold text-[#334155] mt-0.5">
                    {book.available_copies} / {book.total_copies} Copies
                  </p>
                </div>
                <div className="md:col-span-2 mt-2">
                  <p className="text-[10px] font-bold text-[#A0ABC0] uppercase tracking-wider">Description</p>
                  <p className="text-[13px] text-gray-600 mt-0.5 leading-relaxed">
                    {book.description || <span className="text-gray-400 italic">No description provided</span>}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">Book not found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;
