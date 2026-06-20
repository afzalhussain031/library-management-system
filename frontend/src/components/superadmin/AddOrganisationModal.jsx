import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addOrganisationSchema } from '../../schemas/formSchemas'
import { X, Building, AlertCircle } from 'lucide-react'

const AddOrganisationModal = ({ onClose, onAdd }) => {
  // ====== REACT HOOK FORM SETUP ======
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(addOrganisationSchema),
    mode: 'onBlur'
  })

  // ====== FORM SUBMISSION ======
  const onSubmit = (data) => {
    try {
      // Generate random 7-digit Org ID
      const orgId = Math.floor(1000000 + Math.random() * 9000000)

      const newOrg = {
        id: Date.now(),
        name: data.name,
        orgId: String(orgId),
        users: Number(data.users) || 0,
        books: data.books.toLowerCase().endsWith('k') 
          ? data.books 
          : `${Number(data.books) >= 1000 ? (Number(data.books)/1000).toFixed(0) + 'k' : data.books}`,
        plan: 'Pro',
        status: 'Active',
        expiryDate: 'Dec 2026',
        logo: ''
      }

      onAdd(newOrg)
      reset()
      onClose()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  // ====== HELPER: Render input ======
  const renderInput = (fieldName, label) => (
    <div>
      <label className="block text-xs font-bold text-[#A0ABC0] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input 
        type="text"
        placeholder={`e.g. ${fieldName === 'name' ? 'Indemy Institute' : '500'}`}
        {...register(fieldName)}
        className={`w-full bg-slate-50 border rounded-[14px] px-4 py-2.5 text-sm font-semibold text-[#1C2434] outline-none transition ${
          errors[fieldName]
            ? 'border-red-500 bg-red-50'
            : 'border-slate-200 focus:border-indigo-400 focus:bg-white'
        }`}
        disabled={isSubmitting}
      />
      {errors[fieldName] && (
        <p className="text-xs text-red-600 mt-1">{errors[fieldName].message}</p>
      )}
    </div>
  )

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-[500px] bg-white rounded-[32px] shadow-2xl border border-white/50 p-8 flex flex-col gap-6 overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0px 24px 60px -10px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
              <Building className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-extrabold text-[#1C2434]">Add Organisation</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-[#A0ABC0] hover:text-[#1C2434] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ════════════════════════════════════════
            FORM
            ════════════════════════════════════════ */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Organisation Name */}
          {renderInput('name', 'Organisation Name')}

          {/* Grid: Users and Books */}
          <div className="grid grid-cols-2 gap-4">
            {renderInput('users', 'Total Users')}
            {renderInput('books', 'Total Books')}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-2.5 rounded-[14px] transition-all text-sm"
          >
            {isSubmitting ? 'Adding...' : 'Add Organisation'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddOrganisationModal