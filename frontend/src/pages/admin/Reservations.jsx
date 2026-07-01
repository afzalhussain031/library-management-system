import React, { useState, useEffect } from 'react';
import { circulation } from '../../services/api';
import { Clock, CheckCircle, AlertCircle, BookOpen, User, MoreVertical } from 'lucide-react';

const COLUMNS = [
  { id: 'pending', title: 'Pending (Waitlist)', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
  { id: 'ready', title: 'Ready for Pickup', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'fulfilled', title: 'Completed', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' }
];

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // For our "Automated Notification" reassurance

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await circulation.getReservations();
      setReservations(res.data);
    } catch (error) {
      console.error("Failed to fetch reservations", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("reservation_id", id);
  };
  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow dropping
  };
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("reservation_id");
    const reservation = reservations.find(r => r.id.toString() === id);
    if (!reservation || reservation.status === newStatus) return;
    // Optimistic UI Update
    setReservations(prev => prev.map(r => 
      r.id.toString() === id ? { ...r, status: newStatus } : r
    ));
    try {
      await circulation.updateReservationStatus(id, newStatus);
      
      // UX: Reassurance that system is working
      if (newStatus === 'ready') {
        showToast(`Status updated. An automated email has been sent to ${reservation.user_name}.`);
      }
    } catch (error) {
      console.error("Failed to update status", error);
      showToast("Error updating status.", "error");
      fetchReservations(); // Revert on failure
    }
  };

  // --- ACTIONS ---
  const handleFulfill = async (id) => {
    try {
      await circulation.fulfillReservation(id);
      showToast("Book fulfilled and loan issued automatically!");
      fetchReservations(); // Refresh to move it to fulfilled
    } catch (error) {
      showToast("Failed to fulfill reservation.", "error");
    }
  };

   // --- HELPERS ---
  const calculateUrgency = (readyAt) => {
    if (!readyAt) return { color: 'bg-green-100 text-green-800', text: '5 days left' };
    const daysPassed = Math.floor((new Date() - new Date(readyAt)) / (1000 * 60 * 60 * 24));
    
    if (daysPassed <= 3) return { color: 'bg-green-100 text-green-800', text: `${5 - daysPassed} days left` };
    if (daysPassed === 4) return { color: 'bg-yellow-100 text-yellow-800', text: 'Expires tomorrow' };
    return { color: 'bg-red-100 text-red-800 animate-pulse', text: 'Expired - Return to Circ' };
  };

  // Group pending by book to show "Who's next"
  const pendingByBook = reservations
    .filter(r => r.status === 'pending')
    .reduce((acc, curr) => {
      acc[curr.book_id] = acc[curr.book_id] || [];
      acc[curr.book_id].push(curr);
      // Sort by oldest first to establish queue
      acc[curr.book_id].sort((a, b) => new Date(a.reserved_at) - new Date(b.reserved_at));
      return acc;
    }, {});

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Kanban Board...</div>;

     return (
    <div className="p-6 h-full flex flex-col relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-4 right-4 z-50 animate-fade-in-down">
          <div className={`px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 text-white ${
            toast.type === 'success' ? 'bg-slate-800' : 'bg-red-600'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Reservations Workflow</h1>
        <p className="text-slate-500 mt-2">Drag and drop cards to update their status and trigger automated user notifications.</p>
      </div>
      {/* Kanban Board Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)] overflow-hidden">
        {COLUMNS.map(col => {
          const colReservations = reservations.filter(r => r.status === col.id);
          
        return (
            <div 
              key={col.id}
              className={`flex flex-col rounded-2xl border ${col.borderColor} ${col.bgColor} overflow-hidden`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-4 border-b border-black/5 bg-white/50 backdrop-blur-sm">
                <h2 className="font-semibold text-slate-700 flex justify-between items-center">
                  {col.title}
                  <span className="bg-white text-xs px-2 py-1 rounded-full text-slate-500 font-medium shadow-sm border border-slate-100">
                    {colReservations.length}
                  </span>
                </h2>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                
                {/* Empty State Illustration */}
                {colReservations.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                    <BookOpen className="w-12 h-12 text-slate-400 mb-4" />
                    <p className="text-sm text-slate-500 font-medium">The {col.title.toLowerCase()} shelf is clear!</p>
                  </div>
                )}
                {/* Cards */}
                {colReservations.map(res => {
                  // Figure out queue position if pending
                  let queuePosition = null;
                  if (res.status === 'pending') {
                    const queue = pendingByBook[res.book_id] || [];
                    const index = queue.findIndex(q => q.id === res.id);
                    queuePosition = index + 1;
                  }
                  const urgency = calculateUrgency(res.ready_at || res.reserved_at); // Fallback to reserved_at if ready_at isn't added yet
                  return (
                    <div 
                      key={res.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, res.id.toString())}
                      className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative"
                    >
                      {/* Queue position badge for Pending */}
                      {queuePosition && (
                        <div className="absolute -top-3 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                          #{queuePosition} in Queue
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-800 line-clamp-1 pr-4">{res.book_title}</h3>
                        <MoreVertical className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                        <User className="w-4 h-4" />
                        <span>{res.user_name}</span>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                        {/* Timers & Urgency */}
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          {res.status === 'ready' ? (
                            <span className={`px-2 py-0.5 rounded-full ${urgency.color}`}>
                              {urgency.text}
                            </span>
                          ) : (
                            <span>{new Date(res.reserved_at).toLocaleDateString()}</span>
                          )}
                        </div>
                        
                        {/* One-Click Fulfill Button */}
                        {res.status === 'ready' && (
                          <button 
                            onClick={() => handleFulfill(res.id)}
                            className="bg-slate-900 hover:bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                          >
                            Fulfill & Issue
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
