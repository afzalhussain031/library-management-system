import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addMemberSchema } from '../../../schemas/formSchemas';
import { X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../common/Button';
import { membersApi } from '../../../services/api';

export default function AddMemberModal({ open, onClose, onSuccess }) {
  if (!open) return null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(addMemberSchema),
    mode: 'onBlur',
    defaultValues: {
      student_name: '',
      user_id: '',
      email: '',
      phone_number: '',
      department: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        password2: data.password,
      };

      await membersApi.createMember(payload);
      toast.success('Member added successfully!');
      reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to add member:', error);
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.email?.[0] 
        || error.response?.data?.user_id?.[0]
        || 'Failed to add member. Please try again.';
      toast.error(errorMessage);
    }
  };

  const renderField = (fieldName, label, type = 'text', placeholder) => (
    <div className="mb-4">
      <label className="text-[12px] font-bold text-slate-600 mb-1.5 block tracking-wide">
        {label}
      </label>
      <input
        type={type}
        {...register(fieldName)}
        placeholder={placeholder || `Enter ${label}`}
        className={`w-full border rounded-lg px-3.5 py-2.5 text-[13px] text-slate-800 placeholder-slate-300 outline-none transition ${
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
  );

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] transition-opacity animate-[fadeIn_0.15s_ease-out]" 
        onClick={onClose} 
      />
      
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-[460px] bg-white rounded-[26px] p-6 shadow-2xl border border-amber-100/10 flex flex-col pointer-events-auto max-h-[92vh] overflow-hidden transform scale-100 transition-all duration-150 animate-[scaleUp_0.2s_ease-out]">
          
          <div className="flex items-start justify-between mb-5 mt-1 shrink-0">
            <div>
              <h2 className="text-[18px] font-extrabold text-slate-800 tracking-tight">Add New Member</h2>
              <p className="text-[12px] font-medium text-slate-500 mt-1 tracking-wide">Create a new student or staff account.</p>
            </div>
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all duration-150 cursor-pointer -mt-1 -mr-2"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <form id="add-member-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
              {renderField('student_name', 'Full Name', 'text', 'e.g. John Doe')}
              {renderField('user_id', 'Enrollment / Employee ID', 'text', 'e.g. CS2023001')}
              {renderField('email', 'Email Address', 'email', 'e.g. john@example.com')}
              {renderField('phone_number', 'Phone Number', 'tel', '10-digit number')}
              {renderField('department', 'Department / Branch', 'text', 'e.g. Computer Science')}
              
              <div className="mb-4">
                <label className="text-[12px] font-bold text-slate-600 mb-1.5 block tracking-wide">
                  Initial Password
                </label>
                <input
                  type="text"
                  {...register('password')}
                  placeholder="Set an initial password for the user"
                  className={`w-full border rounded-lg px-3.5 py-2.5 text-[13px] text-slate-800 placeholder-slate-300 outline-none transition ${
                    errors.password
                      ? 'border-red-500 bg-red-50'
                      : 'border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                )}
                <p className="text-[11px] text-slate-400 mt-1.5 font-medium tracking-wide">The user will use this password to log in.</p>
              </div>
            </form>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
            >
              Cancel
            </button>
            <Button
              form="add-member-form"
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold text-[13px] px-6 py-2.5 rounded-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={16} className="animate-spin text-slate-700" />
                  Saving...
                </span>
              ) : (
                'Save Member'
              )}
            </Button>
          </div>

        </div>
      </div>
    </>
  );
}
