import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { lendReturnSchema } from '../../schemas/formSchemas'
import { Calendar, X, AlertCircle } from 'lucide-react'

export default function LendReturnModal({ open, onClose }) {
  const [activeTab, setActiveTab] = useState('lend')

  // ====== REACT HOOK FORM SETUP ======
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(lendReturnSchema),
    mode: 'onBlur',
    defaultValues: {
      enrollmentId: '',
      isbn: '',
      bookId: '',
      authorName: '',
      issueDate: '',
      dueDate: '',
      returnDate: ''
    }
  })

  if (!open) return null

  // ====== FORM SUBMISSION ======
  const onSubmit = async (data) => {
    try {
      // data is validated
      const message = activeTab === 'lend'
        ? `Lend Confirmed!\nEnrollment ID: ${data.enrollmentId}\nISBN: ${data.isbn}\nBook ID: ${data.bookId}\nIssue Date: ${data.issueDate}\nDue Date: ${data.dueDate}`
        : `Return Confirmed!\nEnrollment ID: ${data.enrollmentId}\nISBN: ${data.isbn}\nBook ID: ${data.bookId}\nReturn Date: ${data.returnDate}`
      
      alert(message)
      
      // Clear form and close modal
      reset()
      onClose()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  // ====== HELPER: Render input field ======
  const renderField = (fieldName, label) => (
    <div>
      <label className="text-[11px] font-bold text-slate-500 mb-1 block tracking-wide">
        {label}
      </label>
      <input
        type={fieldName.includes('Date') ? 'date' : 'text'}
        {...register(fieldName)}
        placeholder={`Enter ${label}`}
        className={`w-full border rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-300 outline-none transition ${
          errors[fieldName]
            ? 'border-red-500 bg-red-50'
            : 'border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
        }`}
        disabled={isSubmitting}
      />
      {errors[fieldName] && (
        <p className="text-xs text-red-600 mt-1">{errors[fieldName].message}</p>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 animate-[fadeIn_0.15s_ease-out]">
      <div 
        className="bg-white rounded-[26px] p-5 w-[390px] shadow-2xl border border-amber-100/10 flex flex-col relative max-h-[92vh] overflow-y-auto custom-scrollbar transform scale-100 transition-all duration-150 animate-[scaleUp_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ════════════════════════════════════════
            HEADER: Tabs + Close Button
            ════════════════════════════════════════ */}
        <div className="flex items-center gap-2.5 mb-5 mt-1 shrink-0">
          {/* Lend Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('lend')}
            className={`flex-1 rounded-xl py-2.5 text-[13px] font-extrabold tracking-wide transition-all duration-150 cursor-pointer ${
              activeTab === 'lend'
                ? 'bg-[#FDE047] text-slate-800 shadow-sm border border-[#FDE047]'
                : 'bg-white border border-[#FDE047]/40 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Lend Book
          </button>

          {/* Return Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('return')}
            className={`flex-1 rounded-xl py-2.5 text-[13px] font-extrabold tracking-wide transition-all duration-150 cursor-pointer ${
              activeTab === 'return'
                ? 'bg-[#FDE047] text-slate-800 shadow-sm border border-[#FDE047]'
                : 'bg-white border border-[#FDE047]/40 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Return Book
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-all duration-150 cursor-pointer"
            aria-label="Close Modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* ════════════════════════════════════════
            FORM
            ════════════════════════════════════════ */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5 flex-1">
          
          {/* Common fields for both tabs */}
          {renderField('enrollmentId', 'Student Enrollment ID')}
          {renderField('isbn', 'ISBN')}
          {renderField('bookId', 'Book ID')}

          {/* Tab-specific fields */}
          {activeTab === 'lend' ? (
            <>
              {renderField('issueDate', 'Issue Date')}
              {renderField('dueDate', 'Due Date')}
            </>
          ) : (
            <>
              {renderField('authorName', 'Author Name')}
              {renderField('returnDate', 'Return Date')}
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-200 text-slate-900 font-bold text-sm py-2.5 rounded-lg transition-all mt-2"
          >
            {isSubmitting ? 'Processing...' : `${activeTab === 'lend' ? 'Lend' : 'Return'} Book`}
          </button>
        </form>
      </div>
    </div>
  )
}