import { useState } from 'react'
import { Calendar, X } from 'lucide-react'

export default function LendReturnModal({ open, onClose }) {
  const [activeTab, setActiveTab] = useState('lend') // 'lend' or 'return'
  
  // Controlled fields
  const [enrollmentId, setEnrollmentId] = useState('')
  const [isbn, setIsbn] = useState('')
  const [bookId, setBookId] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [returnDate, setReturnDate] = useState('')

  if (!open) return null

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(
      activeTab === 'lend'
        ? `Lend Confirmed!\nEnrollment ID: ${enrollmentId}\nISBN: ${isbn}\nBook ID: ${bookId}\nIssue Date: ${issueDate}\nDue Date: ${dueDate}`
        : `Return Confirmed!\nEnrollment ID: ${enrollmentId}\nISBN: ${isbn}\nBook ID: ${bookId}\nAuthor: ${authorName}\nReturn Date: ${returnDate}`
    )
    
    // Clear fields
    setEnrollmentId('')
    setIsbn('')
    setBookId('')
    setAuthorName('')
    setIssueDate('')
    setDueDate('')
    setReturnDate('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 animate-[fadeIn_0.15s_ease-out]">
      <div 
        className="bg-white rounded-[26px] p-5 w-[390px] shadow-2xl border border-amber-100/10 flex flex-col relative max-h-[92vh] overflow-y-auto custom-scrollbar transform scale-100 transition-all duration-150 animate-[scaleUp_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Tabs + Close Button in same row */}
        <div className="flex items-center gap-2.5 mb-5 mt-1 shrink-0">
          {/* Lend Book Tab */}
          <button
            type="button"
            onClick={() => handleTabChange('lend')}
            className={`flex-1 rounded-xl py-2.5 text-[13px] font-extrabold tracking-wide transition-all duration-150 cursor-pointer ${
              activeTab === 'lend'
                ? 'bg-[#FDE047] text-slate-800 shadow-sm border border-[#FDE047]'
                : 'bg-white border border-[#FDE047]/40 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Lend Book
          </button>

          {/* Return Book Tab */}
          <button
            type="button"
            onClick={() => handleTabChange('return')}
            className={`flex-1 rounded-xl py-2.5 text-[13px] font-extrabold tracking-wide transition-all duration-150 cursor-pointer ${
              activeTab === 'return'
                ? 'bg-[#FDE047] text-slate-800 shadow-sm border border-[#FDE047]'
                : 'bg-white border border-[#FDE047]/40 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Return Book
          </button>

          {/* Close (X) Button — placed after tabs, no overlap */}
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-all duration-150 cursor-pointer"
            aria-label="Close Modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* 2. Interactive Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 flex-1">
          {/* Student Enrollment ID */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 mb-1 block tracking-wide">
              Student Enrollment ID
            </label>
            <input
              type="text"
              required
              value={enrollmentId}
              onChange={(e) => setEnrollmentId(e.target.value)}
              placeholder="Enter Enrollment ID"
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all"
            />
          </div>

          {/* Book ISBN */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 mb-1 block tracking-wide">
              Book ISBN
            </label>
            <input
              type="text"
              required
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="Enter Book ISBN"
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all"
            />
          </div>

          {/* Book ID */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 mb-1 block tracking-wide">
              Book ID
            </label>
            <input
              type="text"
              required
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              placeholder="Enter Book ID"
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all"
            />
          </div>

          {/* CONDITIONAL FIELDS BASED ON ACTIVE TAB */}
          {activeTab === 'lend' ? (
            <>
              {/* Issue Date */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block tracking-wide">
                  Issue Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all pr-9 cursor-pointer"
                  />
                  <Calendar size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block tracking-wide">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all pr-9 cursor-pointer"
                  />
                  <Calendar size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Author Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block tracking-wide">
                  Author Name
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Enter Author Name"
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all"
                />
              </div>

              {/* Return Date */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block tracking-wide">
                  Return Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all pr-9 cursor-pointer"
                  />
                  <Calendar size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </>
          )}

          {/* 3. Action Buttons */}
          <div className="flex gap-3 pt-3 mt-1 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {activeTab === 'lend' ? 'Cancel Lend' : 'Cancel Return'}
            </button>

            <button
              type="submit"
              className="flex-1 bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 py-2.5 rounded-xl font-extrabold text-xs tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {activeTab === 'lend' ? 'Confirm Lend' : 'Confirm Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
