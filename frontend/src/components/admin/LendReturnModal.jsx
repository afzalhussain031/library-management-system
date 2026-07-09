import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lendReturnSchema } from '../../schemas/formSchemas';
import { X, Book, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Select from 'react-select';
import { membersApi, catalog, inventory, circulation } from '../../services/api';

export default function LendReturnModal({ open, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('lend');
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  // States for the Visual Cards
  const [copies, setCopies] = useState([]);
  const [loadingCopies, setLoadingCopies] = useState(false);
  
  const [activeLoans, setActiveLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);

  // ====== REACT HOOK FORM SETUP ======
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(lendReturnSchema),
    mode: 'onBlur',
    defaultValues: {
      enrollmentId: '',
      bookId: '',
      copyId: '',
      loanId: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  });

  const selectedUserId = watch('enrollmentId');
  const selectedBookId = watch('bookId');
  const selectedCopyId = watch('copyId');
  const selectedLoanId = watch('loanId');

  // Fetch users and books for autocomplete (runs once on open)
  useEffect(() => {
    if (open) {
      const fetchOptions = async () => {
        setLoadingOptions(true);
        try {
          const [usersRes, booksRes] = await Promise.all([
            membersApi.getAll(),
            catalog.getBooks()
          ]);
          const usersData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.results || []);
          const booksData = Array.isArray(booksRes.data) ? booksRes.data : (booksRes.data?.results || []);

          setUsers(usersData.map(u => ({ value: u.user_id, label: `${u.user_id} - ${u.student_name || u.name || 'Unknown'}` })));
          setBooks(booksData.map(b => ({ value: b.id?.toString(), label: `${b.isbn || 'No-ISBN'} - ${b.title || 'Unknown'}` })));
        } catch (error) {
          console.error("Failed to load autocomplete options", error);
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchOptions();
    }
  }, [open]);
  
  // Reset when tab changes
  useEffect(() => {
    setValue('copyId', '');
    setValue('loanId', '');
    setValue('bookId', '');
    setCopies([]);
    setActiveLoans([]);
  }, [activeTab, setValue]);

  // Fetch Copies when a Book is selected (for Issue Tab)
  useEffect(() => {
    if (activeTab === 'lend' && selectedBookId) {
      const fetchCopies = async () => {
        setLoadingCopies(true);
        try {
          const res = await inventory.getCopiesByBook(selectedBookId);
          const copiesData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
          setCopies(copiesData);
        } catch (error) {
          console.error("Failed to load copies", error);
          toast.error("Failed to load book copies.");
        } finally {
          setLoadingCopies(false);
        }
      };
      fetchCopies();
    } else {
      setCopies([]);
    }
  }, [selectedBookId, activeTab]);

  // Fetch Active Loans when a User is selected (for Return Tab)
  useEffect(() => {
    if (activeTab === 'return' && selectedUserId) {
      const fetchLoans = async () => {
        setLoadingLoans(true);
        try {
          // Assuming getUserLoans exists and returns loans for the user
          const res = await circulation.getUserLoans(selectedUserId);
          const loansData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
          // Filter only active loans (returned_at === null)
          setActiveLoans(loansData.filter(loan => loan.returned_at === null));
        } catch (error) {
          console.error("Failed to load active loans", error);
          toast.error("Failed to load user's active loans.");
        } finally {
          setLoadingLoans(false);
        }
      };
      fetchLoans();
    } else {
      setActiveLoans([]);
    }
  }, [selectedUserId, activeTab]);

  if (!open) return null;

  // ====== FORM SUBMISSION ======
  const onSubmit = async (data) => {
    try {
      if (activeTab === 'lend') {
        if (!data.copyId) {
          toast.error("Please select an available book copy to issue.");
          return;
        }
        await circulation.issueBook({
          user_id: data.enrollmentId,
          copy_id: data.copyId,
          issued_at: data.issueDate,
          due_at: data.dueDate
        });
        toast.success("Book issued successfully!");
      } else {
        if (!data.loanId) {
          toast.error("Please select an active loan to return.");
          return;
        }
        await circulation.returnBook(data.loanId);
        toast.success("Book returned successfully!");
      }
      
      if (onSuccess) onSuccess();
      reset();
      onClose();
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.response?.data?.detail || "An error occurred.");
    }
  };

  // ====== HELPER: Render Autocomplete Field ======
  const renderAutocomplete = (fieldName, label, options, placeholder) => (
    <div className="mb-4">
      <label className="text-[12px] font-bold text-slate-600 mb-1.5 block tracking-wide">
        {label}
      </label>
      <Controller
        name={fieldName}
        control={control}
        render={({ field: { onChange, value, ref } }) => (
          <Select
            inputRef={ref}
            options={options}
            isLoading={loadingOptions}
            placeholder={placeholder}
            className="text-sm"
            value={options.find(c => c.value === value) || null}
            onChange={(val) => {
              onChange(val?.value || '');
            }}
            styles={{
              control: (base, state) => ({
                ...base,
                borderColor: errors[fieldName] ? '#ef4444' : state.isFocused ? '#fbbf24' : '#e2e8f0',
                boxShadow: state.isFocused ? '0 0 0 1px #fbbf24' : 'none',
                borderRadius: '0.5rem',
                padding: '2px'
              }),
              menuPortal: base => ({ ...base, zIndex: 9999 })
            }}
            menuPortalTarget={document.body}
          />
        )}
      />
      {errors[fieldName] && (
        <p className="text-xs text-red-600 mt-1">{errors[fieldName].message}</p>
      )}
    </div>
  );

  // ====== HELPER: Render native input field ======
  const renderField = (fieldName, label) => (
    <div className="mb-4">
      <label className="text-[12px] font-bold text-slate-600 mb-1.5 block tracking-wide">
        {label}
      </label>
      <input
        type={fieldName.includes('Date') ? 'date' : 'text'}
        {...register(fieldName)}
        placeholder={`Enter ${label}`}
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

  // ====== HELPER: Render Copy Cards (Issue Tab) ======
  const renderCopyCards = () => {
    if (!selectedBookId) return null;
    if (loadingCopies) return <p className="text-sm text-gray-500 my-4 text-center">Loading copies...</p>;
    if (copies.length === 0) return <p className="text-sm text-red-500 my-4 text-center font-medium bg-red-50 p-3 rounded-lg">No physical copies found for this book.</p>;
    
    return (
      <div className="mt-4 mb-6">
        <label className="text-[12px] font-bold text-slate-600 mb-2 block tracking-wide">Select Physical Copy</label>
        <div className="grid grid-cols-2 gap-3">
          {copies.map(copy => {
            const isAvailable = copy.status?.toLowerCase() === 'available';
            const isSelected = selectedCopyId === copy.id.toString();
            return (
              <div 
                key={copy.id}
                onClick={() => {
                  if (isAvailable) setValue('copyId', copy.id.toString(), { shouldValidate: true });
                }}
                className={`p-3 border rounded-xl flex flex-col gap-1 transition-all ${
                  !isAvailable ? 'opacity-60 bg-gray-50 border-gray-200 cursor-not-allowed' 
                  : isSelected ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-400 cursor-pointer shadow-sm'
                  : 'border-gray-200 hover:border-amber-300 cursor-pointer bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">ID: #{copy.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {copy.status}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                  <Book size={12} /> {copy.barcode || 'No barcode'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ====== HELPER: Render Active Loans (Return Tab) ======
  const renderActiveLoans = () => {
    if (!selectedUserId) return null;
    if (loadingLoans) return <p className="text-sm text-gray-500 my-4 text-center">Loading active loans...</p>;
    if (activeLoans.length === 0) return <p className="text-sm text-green-600 my-4 text-center font-medium bg-green-50 p-3 rounded-lg">This user has no active loans.</p>;
    
    return (
      <div className="mt-4 mb-6">
        <label className="text-[12px] font-bold text-slate-600 mb-2 block tracking-wide">Select Active Loan to Return</label>
        <div className="flex flex-col gap-3">
          {activeLoans.map(loan => {
            const isSelected = selectedLoanId === loan.id.toString();
            const isOverdue = new Date(loan.due_at) < new Date();
            return (
              <div 
                key={loan.id}
                onClick={() => setValue('loanId', loan.id.toString(), { shouldValidate: true })}
                className={`p-3 border rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  isSelected ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-400 shadow-sm'
                  : 'border-gray-200 hover:border-amber-300 bg-white'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800 line-clamp-1">{loan.book_title || 'Unknown Book'}</span>
                  <span className="text-xs text-gray-500 mt-0.5">Loan ID: #{loan.id} | Copy ID: #{loan.book_id}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${
                    isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isOverdue ? 'Overdue' : 'Active'}
                  </span>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Clock size={12} className={isOverdue ? "text-red-500" : ""} /> {new Date(loan.due_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] transition-opacity animate-[fadeIn_0.15s_ease-out]" onClick={onClose} />
      
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-[460px] bg-white rounded-[26px] shadow-2xl border border-amber-100/10 flex flex-col pointer-events-auto max-h-[92vh] overflow-hidden transform scale-100 transition-all duration-150 animate-[scaleUp_0.2s_ease-out]">
          
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-slate-50/50">
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Circulation Desk</h2>
            <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="px-6 pt-5 pb-2 shrink-0">
            <div className="flex p-1 bg-slate-100/80 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('lend')}
                className={`flex-1 rounded-lg py-2 text-[13px] font-bold tracking-wide transition-all ${
                  activeTab === 'lend' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                Issue Book
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('return')}
                className={`flex-1 rounded-lg py-2 text-[13px] font-bold tracking-wide transition-all ${
                  activeTab === 'return' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                Return Book
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            <form id="circulation-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
              {renderAutocomplete('enrollmentId', 'Student / Member', users, 'Search by Name or ID...')}
              
              {activeTab === 'lend' ? (
                <>
                  {renderAutocomplete('bookId', 'Book', books, 'Search by Title...')}
                  {renderCopyCards()}
                  <div className="grid grid-cols-2 gap-3 mt-2 border-t border-gray-100 pt-4">
                    {renderField('issueDate', 'Issue Date')}
                    {renderField('dueDate', 'Due Date')}
                  </div>
                </>
              ) : (
                <>
                  {renderActiveLoans()}
                </>
              )}
            </form>
          </div>

          <div className="p-6 border-t border-gray-100 bg-white shrink-0">
            <Button
              form="circulation-form"
              type="submit"
              isLoading={isSubmitting}
              className="w-full bg-[#E0B220] hover:bg-[#D1A61D] text-white shadow-md shadow-yellow-500/20 disabled:bg-gray-200 disabled:text-gray-400 font-bold text-sm py-3.5 rounded-xl transition-all"
            >
              {activeTab === 'lend' ? 'Confirm Issue' : 'Confirm Return'}
            </Button>
          </div>
          
        </div>
      </div>
    </>
  );
}
