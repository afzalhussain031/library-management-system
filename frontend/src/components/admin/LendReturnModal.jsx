import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lendReturnSchema } from '../../schemas/formSchemas';
import { 
  X, Book, Clock, User, CheckCircle2, Plus, Trash2, 
  Hash, CheckSquare, Square, AlertCircle, ShoppingCart, 
  Layers, Calendar, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Select from 'react-select';
import { membersApi, catalog, inventory, circulation } from '../../services/api';
import { clearApiCache } from '../../hook/useApi';

// In-memory cache for autocomplete options to make modal open and search instant (0ms)
let cachedUsersOptions = null;
let cachedBooksOptions = null;
let lastOptionsFetchTime = 0;
const OPTIONS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const copiesCache = new Map();

export default function LendReturnModal({ open, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('lend');
  const [users, setUsers] = useState(cachedUsersOptions || []);
  const [books, setBooks] = useState(cachedBooksOptions || []);
  const [loadingOptions, setLoadingOptions] = useState(!cachedUsersOptions || !cachedBooksOptions);
  
  // Catalogue selection & copies
  const [copies, setCopies] = useState([]);
  const [loadingCopies, setLoadingCopies] = useState(false);
  
  // Multi-Book Issue Queue (Cart)
  const [issueQueue, setIssueQueue] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [defaultDueDate, setDefaultDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  
  // Multi-Book Return State
  const [activeLoans, setActiveLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [selectedLoanIds, setSelectedLoanIds] = useState(new Set());
  const [paidNow, setPaidNow] = useState(false);

  // ====== REACT HOOK FORM SETUP ======
  const {
    control,
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

  // Selected User Object & Borrowing Quota
  const selectedUser = users.find(u => u.value === selectedUserId);
  const maxQuota = selectedUser?.role === 'staff' || selectedUser?.role === 'librarian' ? 10 : 5;
  const remainingSlots = Math.max(0, maxQuota - activeLoans.length);

  // Fetch users and books for autocomplete (instant with cache)
  useEffect(() => {
    if (open) {
      const now = Date.now();
      const hasValidCache = cachedUsersOptions && cachedBooksOptions && (now - lastOptionsFetchTime < OPTIONS_CACHE_TTL);

      if (hasValidCache) {
        setUsers(cachedUsersOptions);
        setBooks(cachedBooksOptions);
        setLoadingOptions(false);
        return;
      }

      if (cachedUsersOptions && cachedBooksOptions) {
        setUsers(cachedUsersOptions);
        setBooks(cachedBooksOptions);
        setLoadingOptions(false);
      } else {
        setLoadingOptions(true);
      }

      const fetchOptions = async () => {
        try {
          const [usersRes, booksRes] = await Promise.all([
            membersApi.getAll(),
            catalog.getBooks()
          ]);
          const usersData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.results || []);
          const booksData = Array.isArray(booksRes.data) ? booksRes.data : (booksRes.data?.results || []);

          const mappedUsers = usersData.map(u => ({ 
            value: u.id?.toString(), 
            label: `${u.user_id} - ${u.student_name || u.name || 'Unknown'}${u.is_active === false ? ' (Suspended)' : ''}`,
            isActive: u.is_active !== false,
            role: u.role || 'student',
            name: u.student_name || u.name || 'Unknown',
            userId: u.user_id
          }));
          const mappedBooks = booksData.map(b => ({ 
            value: b.id?.toString(), 
            label: `${b.isbn || 'No-ISBN'} - ${b.title || 'Unknown'}`,
            title: b.title || 'Unknown Book'
          }));

          cachedUsersOptions = mappedUsers;
          cachedBooksOptions = mappedBooks;
          lastOptionsFetchTime = Date.now();

          setUsers(mappedUsers);
          setBooks(mappedBooks);
        } catch (error) {
          console.error("Failed to load autocomplete options", error);
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchOptions();
    }
  }, [open]);
  
  // Reset when tab changes or modal closes
  useEffect(() => {
    setValue('copyId', '');
    setValue('loanId', '');
    setValue('bookId', '');
    setCopies([]);
    setSelectedLoanIds(new Set());
    setPaidNow(false);
  }, [activeTab, setValue]);

  // Fetch active loans whenever user is selected (used for quota and returns)
  useEffect(() => {
    if (selectedUserId) {
      const fetchLoans = async () => {
        setLoadingLoans(true);
        try {
          const res = await circulation.getUserLoans(selectedUserId);
          const loansData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
          const unreturned = loansData.filter(loan => loan.returned_at === null);
          setActiveLoans(unreturned);
          
          // In return tab, auto-select all loans initially for quick one-click bulk return
          if (activeTab === 'return') {
            setSelectedLoanIds(new Set(unreturned.map(l => l.id.toString())));
          }
        } catch (error) {
          console.error("Failed to load user loans", error);
          toast.error("Failed to load member's loan status.");
        } finally {
          setLoadingLoans(false);
        }
      };
      fetchLoans();
    } else {
      setActiveLoans([]);
      setSelectedLoanIds(new Set());
    }
  }, [selectedUserId, activeTab]);

  // Fetch Copies when a Book is selected
  useEffect(() => {
    if (activeTab === 'lend' && selectedBookId) {
      if (copiesCache.has(selectedBookId)) {
        setCopies(copiesCache.get(selectedBookId));
        setLoadingCopies(false);
      } else {
        setLoadingCopies(true);
      }

      const fetchCopies = async () => {
        try {
          const res = await inventory.getCopiesByBook(selectedBookId);
          const copiesData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
          copiesCache.set(selectedBookId, copiesData);
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

  // ====== MULTI-BOOK QUEUE HANDLERS (ISSUE TAB) ======
  const handleAddCopy = (copy, bookTitle) => {
    if (!selectedUserId) {
      toast.error("Please select a student / member first.");
      return;
    }

    if (selectedUser && !selectedUser.isActive) {
      toast.error("Cannot issue: Member account is currently suspended.");
      return;
    }

    if (issueQueue.some(item => item.copyId === copy.id.toString())) {
      toast.error("This copy is already in the issue queue.");
      return;
    }

    const resolvedTitle = 
      bookTitle || 
      copy.book_title || 
      copy.book?.title || 
      books.find(b => b.value === String(copy.book))?.title || 
      'Unknown Title';

    const locationText = copy.shelf_location 
      ? `Shelf: ${copy.shelf_location}` 
      : (copy.condition ? `Condition: ${copy.condition}` : '');

    const newItem = {
      copyId: copy.id.toString(),
      bookTitle: resolvedTitle,
      accessionNumber: copy.accession_number || `#${copy.id}`,
      shelfLocation: locationText,
      condition: copy.condition || 'Good',
      dueDate: defaultDueDate
    };

    setIssueQueue(prev => [...prev, newItem]);
    toast.success(`Added "${newItem.bookTitle}" to queue.`);
  };

  const handleRemoveFromQueue = (copyId) => {
    setIssueQueue(prev => prev.filter(item => item.copyId !== copyId));
  };

  const handleUpdateItemDueDate = (copyId, newDueDate) => {
    setIssueQueue(prev => prev.map(item => 
      item.copyId === copyId ? { ...item, dueDate: newDueDate } : item
    ));
  };

  const handleApplyDefaultDueDateToAll = (newDate) => {
    setDefaultDueDate(newDate);
    setIssueQueue(prev => prev.map(item => ({ ...item, dueDate: newDate })));
  };

  // Barcode / Accession Scanner Handler
  const handleScanBarcode = async () => {
    const rawCode = barcodeInput.trim();
    if (!rawCode) return;

    if (!selectedUserId) {
      toast.error("Please select a student / member first before adding books to queue.");
      return;
    }

    if (activeLoans.length + issueQueue.length >= maxQuota) {
      toast.error(`Borrowing quota reached (${maxQuota} books max).`);
      return;
    }

    setIsScanning(true);
    try {
      const res = await inventory.getCopyByAccession(rawCode);
      const copiesFound = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      
      if (copiesFound.length === 0) {
        toast.error(`No book copy found with accession number "${rawCode}".`);
        return;
      }

      const copy = copiesFound[0];
      if (copy.status?.toLowerCase() !== 'available') {
        toast.error(`Copy "${copy.accession_number}" is currently ${copy.status}.`);
        return;
      }

      if (issueQueue.some(item => item.copyId === copy.id.toString())) {
        toast.error("This copy is already in the issue queue.");
        return;
      }

      handleAddCopy(copy, copy.book_title || copy.book?.title);
      setBarcodeInput('');
    } catch (err) {
      console.error("Accession lookup failed", err);
      toast.error("Failed to verify copy accession number.");
    } finally {
      setIsScanning(false);
    }
  };

  // ====== MULTI-BOOK RETURN HANDLERS (RETURN TAB) ======
  const getLoanFine = (loan) => {
    if (loan.current_fine_estimate !== undefined && loan.current_fine_estimate !== null) {
      return Number(loan.current_fine_estimate);
    }
    const dueDate = new Date(loan.due_at);
    const now = new Date();
    if (now > dueDate) {
      const diffDays = Math.max(1, Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24)));
      return diffDays * 10;
    }
    return 0;
  };

  const handleToggleLoan = (loanIdStr) => {
    setSelectedLoanIds(prev => {
      const next = new Set(prev);
      if (next.has(loanIdStr)) {
        next.delete(loanIdStr);
      } else {
        next.add(loanIdStr);
      }
      return next;
    });
  };

  const handleToggleSelectAllLoans = () => {
    if (selectedLoanIds.size === activeLoans.length) {
      setSelectedLoanIds(new Set());
    } else {
      setSelectedLoanIds(new Set(activeLoans.map(l => l.id.toString())));
    }
  };

  const totalSelectedFine = activeLoans
    .filter(l => selectedLoanIds.has(l.id.toString()))
    .reduce((sum, loan) => sum + getLoanFine(loan), 0);

  // ====== FORM SUBMISSION ======
  const onSubmit = async () => {
    try {
      if (activeTab === 'lend') {
        if (!selectedUserId) {
          toast.error("Please select a student / member.");
          return;
        }

        if (selectedUser && !selectedUser.isActive) {
          toast.error("Cannot issue books: This member's account is suspended.");
          return;
        }

        if (issueQueue.length === 0) {
          toast.error("Please add at least one book to the issue queue.");
          return;
        }

        if (activeLoans.length + issueQueue.length > maxQuota) {
          toast.error(`Borrowing limit exceeded. Member can borrow at most ${maxQuota} books.`);
          return;
        }

        const payload = {
          borrower: selectedUserId,
          items: issueQueue.map(item => ({
            copy_id: parseInt(item.copyId, 10),
            due_at: item.dueDate
          }))
        };

        const res = await circulation.bulkIssue(payload);
        toast.success(res.data?.detail || `Successfully issued ${issueQueue.length} book(s)!`);
      } else {
        // Return tab
        if (!selectedUserId) {
          toast.error("Please select a member.");
          return;
        }

        if (selectedLoanIds.size === 0) {
          toast.error("Please select at least one active loan to return.");
          return;
        }

        const payload = {
          loan_ids: Array.from(selectedLoanIds).map(id => parseInt(id, 10)),
          paid_now: paidNow,
          payment_method: 'cash'
        };

        const res = await circulation.bulkReturn(payload);
        toast.success(res.data?.detail || `Successfully returned ${selectedLoanIds.size} book(s)!`);
      }
      
      // Invalidate relevant cache so dashboard & circulation reflect changes
      copiesCache.clear();
      lastOptionsFetchTime = 0;
      clearApiCache();

      if (onSuccess) onSuccess();
      reset();
      setIssueQueue([]);
      setSelectedLoanIds(new Set());
      onClose();
    } catch (err) {
      console.error('Circulation error:', err);
      const msg = err.response?.data?.detail || 
                  err.response?.data?.borrower?.[0] || 
                  err.response?.data?.items || 
                  "An error occurred while processing transaction.";
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  if (!open) return null;

  // Format short display date
  const formatShortDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // ====== RENDER: Autocomplete Dropdown ======
  const renderAutocomplete = (fieldName, label, options, placeholder) => (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[12px] font-bold text-slate-700 tracking-wide">
          {label}
        </label>
        {fieldName === 'enrollmentId' && selectedUser && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            selectedUser.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-rose-50 text-rose-700 border border-rose-200/60'
          }`}>
            {selectedUser.isActive ? 'Active Member' : 'Account Suspended'}
          </span>
        )}
      </div>
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
                borderColor: errors[fieldName] ? '#ef4444' : state.isFocused ? '#f59e0b' : '#e2e8f0',
                boxShadow: state.isFocused ? '0 0 0 1px #f59e0b' : 'none',
                borderRadius: '0.6rem',
                padding: '2px',
                minHeight: '40px'
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

  // ====== RENDER: Member Quota Summary Card ======
  const renderMemberQuotaCard = () => {
    if (!selectedUserId || !selectedUser) return null;

    const isExceeded = activeLoans.length + issueQueue.length >= maxQuota;

    return (
      <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
            <User size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-slate-800">{selectedUser.name}</span>
              <span className="text-[11px] text-slate-500 font-mono">({selectedUser.userId})</span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Active Loans: <b className="text-slate-700">{activeLoans.length}</b></span>
              <span>•</span>
              <span>Role: <b className="capitalize text-slate-700">{selectedUser.role}</b></span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
            isExceeded 
              ? 'bg-rose-50 text-rose-700 border-rose-200' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {Math.max(0, remainingSlots - issueQueue.length)} of {maxQuota} slots free
          </span>
        </div>
      </div>
    );
  };

  // ====== RENDER: Direct Accession Number Entry (Issue Tab) ======
  const renderAccessionInput = () => (
    <div className="mb-4 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[12px] font-bold text-amber-950 flex items-center gap-1.5">
          <Hash size={15} className="text-amber-600" /> Quick Accession Number Entry
        </label>
        <span className="text-[10px] text-amber-700 font-medium">Type Accession No. & press Enter</span>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input 
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleScanBarcode();
              }
            }}
            placeholder="Enter Accession Number (e.g. 44123)..."
            className="w-full border border-amber-200 bg-white rounded-lg px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            disabled={isScanning}
          />
        </div>
        <button
          type="button"
          onClick={handleScanBarcode}
          disabled={isScanning || !barcodeInput.trim()}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
        >
          {isScanning ? (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          Add to Queue
        </button>
      </div>
    </div>
  );

  // ====== RENDER: Available Copies Grid (Catalogue Lookup) ======
  const renderCopyCards = () => {
    if (!selectedBookId) return null;
    if (loadingCopies) {
      return (
        <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          Loading physical copies...
        </div>
      );
    }
    if (copies.length === 0) {
      return (
        <div className="my-3 p-3 rounded-xl bg-rose-50/80 border border-rose-200/60 text-center">
          <p className="text-xs text-rose-700 font-semibold">No physical copies registered for this book.</p>
        </div>
      );
    }

    const availableCount = copies.filter(c => c.status?.toLowerCase() === 'available').length;
    const selectedBookObj = books.find(b => b.value === selectedBookId);

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] font-bold text-slate-700 tracking-wide">
            Available Copies in Library
          </label>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            availableCount > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {availableCount} of {copies.length} available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
          {copies.map(copy => {
            const isAvailable = copy.status?.toLowerCase() === 'available';
            const inQueue = issueQueue.some(item => item.copyId === copy.id.toString());

            return (
              <div 
                key={copy.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  !isAvailable 
                    ? 'bg-slate-50 border-slate-200 opacity-70 cursor-not-allowed'
                    : inQueue
                      ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-white border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-slate-800 font-mono truncate">
                      {copy.accession_number || `#${copy.id}`}
                    </span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded capitalize ${
                      isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {copy.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                    {copy.shelf_location ? `Shelf: ${copy.shelf_location}` : (copy.condition || 'Good')}
                  </span>
                </div>

                {isAvailable && (
                  <button
                    type="button"
                    onClick={() => {
                      if (inQueue) {
                        handleRemoveFromQueue(copy.id.toString());
                      } else {
                        handleAddCopy(copy, selectedBookObj?.title);
                      }
                    }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                      inQueue 
                        ? 'bg-amber-200 text-amber-900 hover:bg-rose-100 hover:text-rose-800'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-900'
                    }`}
                  >
                    {inQueue ? 'Remove' : '+ Add'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ====== RENDER: Multi-Book Issue Queue (Cart) ======
  const renderIssueQueue = () => {
    return (
      <div className="mt-2 mb-4 border-t border-slate-200 pt-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <ShoppingCart size={15} className="text-amber-600" />
            <span className="text-[13px] font-bold text-slate-800">
              Issue Queue ({issueQueue.length})
            </span>
          </div>

          {issueQueue.length > 0 && (
            <button
              type="button"
              onClick={() => setIssueQueue([])}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
            >
              Clear Queue
            </button>
          )}
        </div>

        {/* Global Due Date Controller */}
        <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-semibold">
            <Calendar size={13} className="text-slate-400" />
            <span>Default Due Date:</span>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="date"
              value={defaultDueDate}
              onChange={(e) => handleApplyDefaultDueDateToAll(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-amber-400 font-mono text-slate-800"
            />
            <span className="text-[10px] text-slate-400 font-medium">(Applies to all)</span>
          </div>
        </div>

        {issueQueue.length === 0 ? (
          <div className="p-5 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
            <Book size={22} className="mx-auto text-slate-300 mb-1" />
            <p className="text-xs text-slate-500 font-semibold">Issue Queue is currently empty</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Enter an Accession Number above or pick from the catalogue to add books.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
            {issueQueue.map((item, idx) => (
              <div 
                key={item.copyId}
                className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs hover:border-amber-200 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[13px] font-bold text-slate-800 truncate" title={item.bookTitle}>
                      {item.bookTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 pl-7">
                    <span className="font-mono text-slate-700 font-semibold">Acc No: {item.accessionNumber}</span>
                    {item.shelfLocation && (
                      <>
                        <span>•</span>
                        <span className="truncate">{item.shelfLocation}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-end">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Due</label>
                    <input 
                      type="date"
                      value={item.dueDate}
                      onChange={(e) => handleUpdateItemDueDate(item.copyId, e.target.value)}
                      className="text-[11px] font-mono px-2 py-0.5 border border-slate-200 rounded bg-slate-50 focus:bg-white text-slate-800 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFromQueue(item.copyId)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                    title="Remove from queue"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ====== RENDER: Multi-Book Return Checklist ======
  const renderActiveLoansChecklist = () => {
    if (!selectedUserId) return null;
    if (loadingLoans) {
      return (
        <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-2 text-sm text-slate-500">
          <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          Loading active loans...
        </div>
      );
    }
    if (activeLoans.length === 0) {
      return (
        <div className="my-6 p-5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-center">
          <CheckCircle2 size={24} className="mx-auto text-emerald-600 mb-1" />
          <p className="text-sm text-emerald-800 font-bold">No active loans found</p>
          <p className="text-xs text-emerald-600 mt-0.5">This member has returned all borrowed books.</p>
        </div>
      );
    }

    const allSelected = selectedLoanIds.size === activeLoans.length;

    return (
      <div className="mt-3 mb-4">
        {/* Header Action Bar */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSelectAllLoans}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-600 transition-colors cursor-pointer"
            >
              {allSelected ? (
                <CheckSquare size={16} className="text-amber-600" />
              ) : (
                <Square size={16} className="text-slate-400" />
              )}
              <span>Select All ({activeLoans.length})</span>
            </button>
          </div>

          <span className="text-[11px] font-bold text-slate-500">
            {selectedLoanIds.size} of {activeLoans.length} selected
          </span>
        </div>

        {/* Loans Cards */}
        <div className="space-y-2.5 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
          {activeLoans.map(loan => {
            const isSelected = selectedLoanIds.has(loan.id.toString());
            const fine = getLoanFine(loan);
            const isOverdue = fine > 0;

            return (
              <div 
                key={loan.id}
                onClick={() => handleToggleLoan(loan.id.toString())}
                className={`p-3 border rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-amber-400 bg-amber-50/60 ring-1 ring-amber-400 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="shrink-0 text-slate-400">
                    {isSelected ? (
                      <CheckSquare size={18} className="text-amber-600" />
                    ) : (
                      <Square size={18} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-slate-800 truncate" title={loan.book_title}>
                      {loan.book_title || 'Unknown Book'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Loan #{loan.id} • Acc No: {loan.copy_accession_number || `#${loan.copy}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-1 ${
                    isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isOverdue ? `Overdue (₹${fine})` : 'On Time'}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock size={11} className={isOverdue ? "text-rose-500" : "text-slate-400"} />
                    Due {formatShortDate(loan.due_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ====== RENDER: Batch Fine & Payment Settlement ======
  const renderFineSettlementPanel = () => {
    if (activeTab !== 'return' || selectedLoanIds.size === 0 || totalSelectedFine <= 0) return null;

    return (
      <div className="bg-rose-50/80 border border-rose-200/80 p-4 rounded-xl mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600" />
            <span className="text-[13px] font-extrabold text-rose-800">
              Overdue Fines Incurred
            </span>
          </div>
          <span className="text-[15px] font-black text-rose-700">
            Total: ₹{totalSelectedFine}
          </span>
        </div>
        <p className="text-[11px] text-rose-600 mb-3">
          Fines calculated for {selectedLoanIds.size} selected book(s) at ₹10 per overdue day.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <label className={`flex items-center gap-2.5 p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
            paidNow ? 'bg-white border-emerald-500' : 'bg-white/60 border-slate-200'
          }`}>
            <input 
              type="radio"
              name="finePaymentOption"
              checked={paidNow === true}
              onChange={() => setPaidNow(true)}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <span className={`text-[12px] font-bold ${paidNow ? 'text-emerald-700' : 'text-slate-600'}`}>
              Collect Now (Cash)
            </span>
          </label>

          <label className={`flex items-center gap-2.5 p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
            !paidNow ? 'bg-white border-rose-400' : 'bg-white/60 border-slate-200'
          }`}>
            <input 
              type="radio"
              name="finePaymentOption"
              checked={paidNow === false}
              onChange={() => setPaidNow(false)}
              className="text-rose-600 focus:ring-rose-500"
            />
            <span className={`text-[12px] font-bold ${!paidNow ? 'text-rose-700' : 'text-slate-600'}`}>
              Add to Dues
            </span>
          </label>
        </div>
      </div>
    );
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] transition-opacity animate-[fadeIn_0.15s_ease-out]" 
        onClick={onClose} 
      />
      
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-[620px] bg-white rounded-[26px] p-6 shadow-2xl border border-amber-100/10 flex flex-col pointer-events-auto max-h-[92vh] overflow-hidden transform scale-100 transition-all duration-150 animate-[scaleUp_0.2s_ease-out]">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-4 mt-1 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[19px] font-extrabold text-slate-800 tracking-tight">Circulation Desk</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
                  <Sparkles size={11} /> Batch Support
                </span>
              </div>
              <p className="text-[12px] font-medium text-slate-500 mt-0.5 tracking-wide">
                Issue or return multiple books simultaneously for a member.
              </p>
            </div>
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all duration-150 cursor-pointer -mt-1 -mr-2"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="pb-3 shrink-0">
            <div className="flex p-1 bg-slate-100/80 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('lend')}
                className={`flex-1 rounded-lg py-2 text-[13px] font-bold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'lend' 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <Layers size={14} className={activeTab === 'lend' ? "text-amber-500" : ""} />
                Issue Multiple Books {issueQueue.length > 0 && `(${issueQueue.length})`}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('return')}
                className={`flex-1 rounded-lg py-2 text-[13px] font-bold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'return' 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <CheckCircle2 size={14} className={activeTab === 'return' ? "text-amber-500" : ""} />
                Return Multiple Books {selectedLoanIds.size > 0 && `(${selectedLoanIds.size})`}
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <form id="circulation-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
              {/* Member Selection */}
              {renderAutocomplete(
                'enrollmentId', 
                'Student / Member', 
                activeTab === 'lend' ? users.filter(u => u.isActive) : users, 
                activeTab === 'lend' ? 'Search Active Member by Name or Roll No...' : 'Search by Name or Roll No...'
              )}

              {/* Member Quota Summary Card */}
              {renderMemberQuotaCard()}
              
              {activeTab === 'lend' ? (
                <>
                  {/* Direct Accession Number Entry */}
                  {renderAccessionInput()}

                  {/* Catalogue Book Selection */}
                  {renderAutocomplete('bookId', 'Search Book Title from Catalogue', books, 'Search book title or ISBN...')}
                  
                  {/* Available Copies Chips */}
                  {renderCopyCards()}

                  {/* Multi-Book Issue Queue (Cart) */}
                  {renderIssueQueue()}
                </>
              ) : (
                <>
                  {/* Active Loans Checklist */}
                  {renderActiveLoansChecklist()}

                  {/* Fine Settlement Panel */}
                  {renderFineSettlementPanel()}
                </>
              )}
            </form>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 shrink-0">
            <div className="text-xs text-slate-500">
              {activeTab === 'lend' ? (
                <span>Queue: <b className="text-slate-800">{issueQueue.length}</b> book(s)</span>
              ) : (
                <span>Selected: <b className="text-slate-800">{selectedLoanIds.size}</b> of {activeLoans.length}</span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              >
                Cancel
              </button>
              <Button
                form="circulation-form"
                type="submit"
                isLoading={isSubmitting}
                loadingText={activeTab === 'lend' ? 'Issuing...' : 'Returning...'}
                disabled={
                  activeTab === 'lend' 
                    ? issueQueue.length === 0 || issueQueue.length > remainingSlots
                    : selectedLoanIds.size === 0
                }
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-[13px] px-6 py-2.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {activeTab === 'lend' 
                  ? `Issue ${issueQueue.length} Book${issueQueue.length === 1 ? '' : 's'}`
                  : `Return ${selectedLoanIds.size} Book${selectedLoanIds.size === 1 ? '' : 's'}`
                }
              </Button>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
