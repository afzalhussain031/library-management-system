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
  const [fineDetails, setFineDetails] = useState({ isOverdue: false, amount: 0, loading: false });
  const [paidNow, setPaidNow] = useState(false);

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

          setUsers(usersData.map(u => ({ value: u.id?.toString(), label: `${u.user_id} - ${u.student_name || u.name || 'Unknown'}` })));
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

  // Fetch Fine Details if overdue
  useEffect(() => {
    if (activeTab === 'return' && selectedLoanId) {
      const loan = activeLoans.find(l => l.id.toString() === selectedLoanId);
      if (loan) {
        const isOverdue = new Date(loan.due_at) < new Date();
        if (isOverdue) {
          setFineDetails({ isOverdue: true, amount: 0, loading: true });
          circulation.calculateFine(loan.id)
            .then(res => setFineDetails({ isOverdue: true, amount: res.data.fine_amount, loading: false }))
            .catch(() => setFineDetails({ isOverdue: true, amount: 0, loading: false }));
        } else {
          setFineDetails({ isOverdue: false, amount: 0, loading: false });
          setPaidNow(false);
        }
      }
    } else {
      setFineDetails({ isOverdue: false, amount: 0, loading: false });
      setPaidNow(false);
    }
  }, [selectedLoanId, activeTab, activeLoans]);

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
          borrower: data.enrollmentId,
          copy: data.copyId,
          issued_at: data.issueDate,
          due_at: data.dueDate
        });
        toast.success("Book issued successfully!");
      } else {
        if (!data.loanId) {
          toast.error("Please select an active loan to return.");
          return;
        }
        await circulation.returnBook(data.loanId, paidNow);
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

  // ====== HELPER: Render Fine Options ======
  const renderFineOptions = () => {
    if (activeTab !== 'return' || !selectedLoanId || !fineDetails.isOverdue) return null;
    
    return (
      <div className="bg-[#FFE2E5]/50 border border-[#F64E60]/20 p-5 rounded-xl mb-4">
        {fineDetails.loading ? (
          <p className="text-sm text-[#F64E60]">Calculating fine...</p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-extrabold text-[#F64E60] text-base">This book is overdue!</p>
            </div>
            <p className="text-[#F64E60]/90 font-medium text-[13px] mb-3">A fine of <span className="font-extrabold text-[#F64E60] text-[15px]">Rs. {fineDetails.amount}</span> has been generated.</p>
            
            <div className="flex flex-col gap-2.5">
              <p className="text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">Select Payment Option</p>
              
              <label className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paidNow ? 'bg-white border-[#1BC5BD]' : 'bg-white/60 border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="modalPaymentOption"
                    checked={paidNow === true}
                    onChange={() => setPaidNow(true)}
                    className="w-4 h-4 text-[#1BC5BD] focus:ring-[#1BC5BD]"
                  />
                  <span className={`text-[14px] font-bold ${paidNow ? 'text-[#1BC5BD]' : 'text-slate-600'}`}>Pay Fine Now</span>
                </div>
              </label>

              <label className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${!paidNow ? 'bg-white border-[#F64E60]' : 'bg-white/60 border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="modalPaymentOption"
                    checked={paidNow === false}
                    onChange={() => setPaidNow(false)}
                    className="w-4 h-4 text-[#F64E60] focus:ring-[#F64E60]"
                  />
                  <span className={`text-[14px] font-bold ${!paidNow ? 'text-[#F64E60]' : 'text-slate-600'}`}>Add to Account Dues</span>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] transition-opacity animate-[fadeIn_0.15s_ease-out]" onClick={onClose} />
      
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-[460px] bg-white rounded-[26px] p-6 shadow-2xl border border-amber-100/10 flex flex-col pointer-events-auto max-h-[92vh] overflow-hidden transform scale-100 transition-all duration-150 animate-[scaleUp_0.2s_ease-out]">
          
          <div className="flex items-start justify-between mb-5 mt-1 shrink-0">
            <div>
              <h2 className="text-[18px] font-extrabold text-slate-800 tracking-tight">Circulation Desk</h2>
              <p className="text-[12px] font-medium text-slate-500 mt-1 tracking-wide">Lend or return books directly from the desk.</p>
            </div>
            <button type="button" onClick={onClose} className="flex-shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all duration-150 cursor-pointer -mt-1 -mr-2">
              <X size={18} />
            </button>
          </div>

          <div className="pb-4 shrink-0">
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

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
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
                  {renderFineOptions()}
                </>
              )}
            </form>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
            >
              Cancel
            </button>
            <Button
              form="circulation-form"
              type="submit"
              isLoading={isSubmitting}
              loadingText={activeTab === 'lend' ? 'Issuing...' : 'Returning...'}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold text-[13px] px-6 py-2.5 rounded-lg transition-all disabled:opacity-50"
            >
              {activeTab === 'lend' ? 'Confirm Issue' : 'Confirm Return'}
            </Button>
          </div>
          
        </div>
      </div>
    </>
  );
}
