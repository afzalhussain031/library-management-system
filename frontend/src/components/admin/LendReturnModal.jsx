import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lendReturnSchema } from '../../schemas/formSchemas';
import { X, Book, Clock, User, CheckCircle2 } from 'lucide-react';
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

          setUsers(usersData.map(u => ({ 
            value: u.id?.toString(), 
            label: `${u.user_id} - ${u.student_name || u.name || 'Unknown'}${u.is_active === false ? ' (Suspended)' : ''}`,
            isActive: u.is_active !== false
          })));
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
        const targetUser = users.find(u => u.value === data.enrollmentId);
        if (targetUser && !targetUser.isActive) {
          toast.error("Cannot issue book: This member's account is currently suspended.");
          return;
        }
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
      const msg = err.response?.data?.borrower?.[0] || err.response?.data?.borrower || err.response?.data?.detail || "An error occurred.";
      toast.error(msg);
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

  // Format short display date
  const formatShortDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // ====== HELPER: Render Copy Cards (Issue Tab) ======
  const renderCopyCards = () => {
    if (!selectedBookId) return null;
    if (loadingCopies) {
      return (
        <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-2 text-sm text-slate-500">
          <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          Loading physical copies...
        </div>
      );
    }
    if (copies.length === 0) {
      return (
        <div className="my-5 p-4 rounded-xl bg-rose-50/80 border border-rose-200/60 text-center">
          <p className="text-sm text-rose-700 font-semibold">No physical copies registered for this book.</p>
          <p className="text-xs text-rose-500 mt-0.5">Please add physical copies to the inventory first.</p>
        </div>
      );
    }

    const availableCount = copies.filter(c => c.status?.toLowerCase() === 'available').length;
    // Sort available copies first, then by accession number
    const sortedCopies = [...copies].sort((a, b) => {
      const aAvail = a.status?.toLowerCase() === 'available';
      const bAvail = b.status?.toLowerCase() === 'available';
      if (aAvail && !bAvail) return -1;
      if (!aAvail && bAvail) return 1;
      return String(a.accession_number || '').localeCompare(String(b.accession_number || ''));
    });

    return (
      <div className="mt-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] font-bold text-slate-700 tracking-wide">
            Select Physical Copy
          </label>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            availableCount > 0 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
          }`}>
            {availableCount} of {copies.length} available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[250px] overflow-y-auto pr-1">
          {sortedCopies.map(copy => {
            const isAvailable = copy.status?.toLowerCase() === 'available';
            const isLoaned = copy.status?.toLowerCase() === 'loaned';
            const isSelected = selectedCopyId === copy.id.toString();
            const loan = copy.current_loan;

            return (
              <div 
                key={copy.id}
                onClick={() => {
                  if (isAvailable) setValue('copyId', copy.id.toString(), { shouldValidate: true });
                }}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  !isAvailable 
                    ? 'bg-slate-50/80 border-slate-200/70 cursor-not-allowed opacity-90' 
                    : isSelected 
                      ? 'border-amber-400 bg-amber-50/70 ring-2 ring-amber-400 shadow-sm cursor-pointer'
                      : 'border-slate-200 hover:border-amber-300 hover:shadow-xs bg-white cursor-pointer'
                }`}
              >
                <div>
                  {/* Header: Accession Number & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-bold text-slate-800 tracking-tight font-mono">
                      Acc No: {copy.accession_number || `#${copy.id}`}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                      isAvailable 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : isLoaned 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-amber-100 text-amber-800'
                    }`}>
                      {copy.status}
                    </span>
                  </div>

                  {/* Body: Loan details if Loaned, or Location/Condition if Available */}
                  {isLoaned ? (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <User size={12} className="text-rose-500 shrink-0" />
                        <span className="truncate" title={loan?.borrower_name || 'Loaned out'}>
                          {loan ? `${loan.borrower_name} (${loan.borrower_user_id})` : 'Loaned out'}
                        </span>
                      </div>
                      {loan?.due_at && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock size={12} className={loan.is_overdue ? "text-rose-500 shrink-0" : "text-slate-400 shrink-0"} />
                          <span className={loan.is_overdue ? "text-rose-600 font-semibold" : ""}>
                            Due {formatShortDate(loan.due_at)} {loan.is_overdue ? '(Overdue)' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1 truncate">
                        <Book size={12} className="text-slate-400 shrink-0" />
                        {copy.shelf_location ? `Shelf: ${copy.shelf_location}` : (copy.condition || 'Good Condition')}
                      </span>
                      {isSelected && (
                        <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5 shrink-0">
                          <CheckCircle2 size={12} /> Selected
                        </span>
                      )}
                    </div>
                  )}
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
                  <span className="text-xs text-gray-500 mt-0.5">Loan ID: #{loan.id} | Acc No: {loan.copy_accession_number || `#${loan.copy}`}</span>
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
              {renderAutocomplete(
                'enrollmentId', 
                'Student / Member', 
                activeTab === 'lend' ? users.filter(u => u.isActive) : users, 
                activeTab === 'lend' ? 'Search Active Member by Name or Roll No...' : 'Search by Name or Roll No...'
              )}
              
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
