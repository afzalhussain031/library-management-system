import React, { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Plus,
  Trash2,
  BookPlus,
  Copy,
  Library,
  BookOpen,
  AlertCircle,
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-hot-toast";
import Button from "../../common/Button";
import { catalog, inventory } from "../../../services/api";

const extractErrorMessage = (error, defaultMsg) => {
  const errorData = error?.response?.data;
  if (!errorData) return error?.message || defaultMsg;
  if (typeof errorData === "string") return errorData;
  if (errorData.detail) return errorData.detail;

  if (errorData.isbn?.[0]) return `ISBN: ${errorData.isbn[0]}`;
  if (errorData.accession_number?.[0]) return `Accession Number: ${errorData.accession_number[0]}`;
  if (errorData.name?.[0]) return `Name: ${errorData.name[0]}`;

  const keys = Object.keys(errorData);
  if (keys.length > 0) {
    const firstKey = keys[0];
    const firstVal = errorData[firstKey];
    const formattedKey = firstKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    if (Array.isArray(firstVal) && firstVal.length > 0) {
      return `${formattedKey}: ${firstVal[0]}`;
    }
    if (typeof firstVal === "string") {
      return `${formattedKey}: ${firstVal}`;
    }
  }

  return defaultMsg;
};

const newBookSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  author: z
    .object({ label: z.string(), value: z.union([z.string(), z.number()]), __isNew__: z.boolean().optional() })
    .nullable()
    .refine((val) => val !== null && val.label.trim().length > 0, { message: "Author is required" }),
  isbn: z
    .string()
    .trim()
    .min(1, "ISBN is required")
    .refine(
      (val) => {
        const clean = val.replace(/[-\s]/g, "");
        return clean.length === 10 || clean.length === 13;
      },
      { message: "ISBN must be 10 or 13 digits (hyphens are allowed)" }
    ),
  published_date: z.string().min(1, "Published date is required"),
  category: z
    .object({ label: z.string(), value: z.union([z.string(), z.number()]), __isNew__: z.boolean().optional() })
    .nullable()
    .refine((val) => val !== null, { message: "Category is required" }),
  publisher: z
    .object({ label: z.string(), value: z.union([z.string(), z.number()]), __isNew__: z.boolean().optional() })
    .nullable()
    .refine((val) => val !== null, { message: "Publisher is required" }),
  copies: z.array(
    z.object({
      accession_number: z.string().trim().min(1, "Accession number is required"),
      shelf_location: z.string().optional(),
    })
  ),
});

const AddBookModal = ({ isOpen, onClose, onSuccess, bookToEdit = null }) => {
  // Mode selection: "new" (Create New Book) | "existing" (Add Copies to Existing Book)
  const [activeTab, setActiveTab] = useState("new");
  const [booksList, setBooksList] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for "Add Copies to Existing Book" mode
  const [selectedExistingBook, setSelectedExistingBook] = useState(null);
  const [existingCopies, setExistingCopies] = useState([
    { accession_number: "", shelf_location: "" },
  ]);

  // State for "Bulk Import (CSV)" mode
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(newBookSchema),
    defaultValues: {
      title: "",
      author: null,
      isbn: "",
      published_date: "",
      category: null,
      publisher: null,
      copies: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "copies",
  });

  const fetchOptions = async () => {
    setIsLoadingOptions(true);
    try {
      const [bookRes, catRes, pubRes] = await Promise.all([
        catalog.getBooks(),
        catalog.getCategories(),
        catalog.getPublishers(),
      ]);
      const rawBooks = Array.isArray(bookRes.data) ? bookRes.data : bookRes.data?.results || [];
      const rawCats = Array.isArray(catRes.data) ? catRes.data : catRes.data?.results || [];
      const rawPubs = Array.isArray(pubRes.data) ? pubRes.data : pubRes.data?.results || [];

      setBooksList(rawBooks);
      setCategories(rawCats.map((c) => ({ label: c.name, value: c.id })));
      setPublishers(rawPubs.map((p) => ({ label: p.name, value: p.id })));

      const uniqueAuthors = Array.from(
        new Set(rawBooks.map((b) => b.author?.trim()).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b));
      setAuthors(uniqueAuthors.map((a) => ({ label: a, value: a })));
    } catch (error) {
      console.error("Failed to fetch options", error);
      toast.error("Failed to load catalog data");
    } finally {
      setIsLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOptions();

      if (bookToEdit) {
        // Edit Mode: Lock tab to "new" metadata form and prefill data
        setActiveTab("new");
        reset({
          title: bookToEdit.title || "",
          author: bookToEdit.author
            ? { label: bookToEdit.author, value: bookToEdit.author }
            : null,
          isbn: bookToEdit.isbn || "",
          published_date: bookToEdit.published_date || "",
          category: bookToEdit.category
            ? { label: bookToEdit.category.name, value: bookToEdit.category.id }
            : null,
          publisher: bookToEdit.publisher
            ? { label: bookToEdit.publisher.name, value: bookToEdit.publisher.id }
            : null,
          copies: [],
        });
      } else {
        // Add Mode: Reset both forms
        setActiveTab("new");
        reset({
          title: "",
          author: null,
          isbn: "",
          published_date: "",
          category: null,
          publisher: null,
          copies: [],
        });
        setSelectedExistingBook(null);
        setExistingCopies([{ accession_number: "", shelf_location: "" }]);
      }
    }
  }, [isOpen, bookToEdit, reset]);

  // Submit Handler: Create New Book OR Edit Existing Book
  const onNewBookSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let categoryId = data.category.value;
      let publisherId = data.publisher.value;

      // Create Category if it's new
      if (data.category.__isNew__) {
        const catLabel = data.category.label.trim();
        // Check if category already exists in loaded options
        const existingCat = categories.find(
          (c) => c.label.toLowerCase() === catLabel.toLowerCase()
        );
        if (existingCat) {
          categoryId = existingCat.value;
        } else {
          try {
            const res = await catalog.createCategory({ name: catLabel });
            categoryId = res.data.id;
            setCategories((prev) => [...prev, { label: res.data.name, value: res.data.id }]);
          } catch (catErr) {
            // If already exists on server, fetch and match
            try {
              const refreshRes = await catalog.getCategories();
              const rawCats = Array.isArray(refreshRes.data)
                ? refreshRes.data
                : refreshRes.data?.results || [];
              const match = rawCats.find(
                (c) => c.name.toLowerCase() === catLabel.toLowerCase()
              );
              if (match) {
                categoryId = match.id;
              } else {
                throw catErr;
              }
            } catch {
              throw catErr;
            }
          }
        }
      }

      // Create Publisher if it's new
      if (data.publisher.__isNew__) {
        const pubLabel = data.publisher.label.trim();
        // Check if publisher already exists in loaded options
        const existingPub = publishers.find(
          (p) => p.label.toLowerCase() === pubLabel.toLowerCase()
        );
        if (existingPub) {
          publisherId = existingPub.value;
        } else {
          try {
            const res = await catalog.createPublisher({ name: pubLabel });
            publisherId = res.data.id;
            setPublishers((prev) => [...prev, { label: res.data.name, value: res.data.id }]);
          } catch (pubErr) {
            try {
              const refreshRes = await catalog.getPublishers();
              const rawPubs = Array.isArray(refreshRes.data)
                ? refreshRes.data
                : refreshRes.data?.results || [];
              const match = rawPubs.find(
                (p) => p.name.toLowerCase() === pubLabel.toLowerCase()
              );
              if (match) {
                publisherId = match.id;
              } else {
                throw pubErr;
              }
            } catch {
              throw pubErr;
            }
          }
        }
      }

      // Author string resolution
      const authorName = data.author?.label?.trim() || "";

      // Clean ISBN: strip hyphens and spaces
      const cleanIsbn = data.isbn.replace(/[-\s]/g, "").trim();

      const bookData = {
        title: data.title.trim(),
        author: authorName,
        isbn: cleanIsbn,
        published_date: data.published_date,
        category_id: categoryId,
        publisher_id: publisherId,
      };

      if (data.author?.__isNew__) {
        setAuthors((prev) => {
          const exists = prev.some((a) => a.label.toLowerCase() === authorName.toLowerCase());
          return exists
            ? prev
            : [...prev, { label: authorName, value: authorName }].sort((a, b) =>
                a.label.localeCompare(b.label)
              );
        });
      }

      if (bookToEdit) {
        // EDIT MODE: Update metadata
        await catalog.updateBook(bookToEdit.id, bookData);
        toast.success("Book metadata updated successfully!");
      } else {
        // CREATE NEW BOOK MODE
        const bookRes = await catalog.addBook(bookData);
        const bookId = bookRes.data.id;

        if (data.copies && data.copies.length > 0) {
          const copyPromises = data.copies.map((copy) =>
            inventory.addBookCopy({
              book: bookId,
              accession_number: copy.accession_number.trim(),
              shelf_location: copy.shelf_location?.trim() || "",
            })
          );
          await Promise.all(copyPromises);
        }
        toast.success("New book and copies added successfully!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save book", error);
      toast.error(
        extractErrorMessage(error, "Failed to process request. Please check your inputs.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Handler: Add Copies to Existing Book
  const onExistingCopiesSubmit = async (e) => {
    e.preventDefault();

    if (!selectedExistingBook) {
      toast.error("Please select a book from the catalog first.");
      return;
    }

    if (existingCopies.length === 0) {
      toast.error("Please add at least one physical copy.");
      return;
    }

    const hasEmptyAccession = existingCopies.some((c) => !c.accession_number?.trim());
    if (hasEmptyAccession) {
      toast.error("Please provide an Accession Number for each copy.");
      return;
    }

    setIsSubmitting(true);
    try {
      const copyPromises = existingCopies.map((copy) =>
        inventory.addBookCopy({
          book: selectedExistingBook.id,
          accession_number: copy.accession_number.trim(),
          shelf_location: copy.shelf_location?.trim() || "",
        })
      );
      await Promise.all(copyPromises);
      toast.success(`${existingCopies.length} physical copies added successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to add copies", error);
      toast.error(
        extractErrorMessage(
          error,
          "Failed to add physical copies. Please check if Accession Numbers are unique."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExistingCopy = () => {
    setExistingCopies([...existingCopies, { accession_number: "", shelf_location: "" }]);
  };

  const handleRemoveExistingCopy = (index) => {
    setExistingCopies(existingCopies.filter((_, i) => i !== index));
  };

  const handleUpdateExistingCopy = (index, field, value) => {
    const updated = [...existingCopies];
    updated[index][field] = value;
    setExistingCopies(updated);
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "ISBN,Name of the book,Author,Publisher,Required Quantity,Sem.,Published Date\n" +
      "978-8121926164,Engineering Mechanics,R.S. Khurmi,S Chand,30,I/II,2002-04-05\n" +
      "978-9350143803,Basic Mechanical Engineering,D S Kumar,S K Kataria,30,I/II,2015-01-01\n" +
      "978-0132350884,Clean Code,Robert C. Martin,Pearson,15,IV,2008-08-01\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "library_books_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a CSV file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await catalog.bulkUploadBooks(formData);
      setUploadResult(res.data);
      toast.success(
        `Imported ${res.data.created_books} books and ${res.data.created_copies} physical copies!`
      );
      if (res.data.created_books > 0 || res.data.created_copies > 0) {
        onSuccess();
      }
    } catch (error) {
      console.error("Bulk upload failed", error);
      toast.error(
        extractErrorMessage(error, "Failed to upload and import CSV file.")
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#FBBF24" : "#E2E8F0",
      boxShadow: state.isFocused ? "0 0 0 1px #FBBF24" : "none",
      backgroundColor: state.isDisabled ? "#F8FAFC" : "white",
      "&:hover": {
        borderColor: state.isFocused ? "#FBBF24" : "#CBD5E1",
      },
      borderRadius: "0.5rem",
      padding: "2px",
      fontSize: "13px",
      color: "#1E293B",
    }),
    singleValue: (base, state) => ({
      ...base,
      color: state.isDisabled ? "#94A3B8" : "#1E293B",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#CBD5E1",
    }),
  };

  const existingBookOptions = booksList.map((b) => ({
    label: `${b.title} (ISBN: ${b.isbn})`,
    value: b.id,
    book: b,
  }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 animate-[fadeIn_0.15s_ease-out] p-4">
      <div
        className="bg-white rounded-[26px] p-6 w-full max-w-4xl shadow-2xl border border-amber-100/10 flex flex-col relative max-h-[92vh] transform transition-all duration-150 animate-[scaleUp_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 mt-1 shrink-0">
          <div>
            <h2 className="text-[18px] font-extrabold text-slate-800">
              {bookToEdit
                ? "Edit Book Metadata"
                : activeTab === "new"
                ? "Create New Book"
                : activeTab === "existing"
                ? "Add Copies to Existing Book"
                : "Bulk Import Books (CSV)"}
            </h2>
            <p className="text-[12px] font-medium text-slate-500 mt-0.5 tracking-wide">
              {bookToEdit
                ? "Update catalog information and metadata for this book."
                : activeTab === "new"
                ? "Enter details to register a brand new title in your catalog."
                : activeTab === "existing"
                ? "Select an existing book and register new physical copies to inventory."
                : "Upload a CSV spreadsheet to import multiple books and physical copies at once."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all duration-150 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Clear Mode Switcher (Hidden when editing a specific book) */}
        {!bookToEdit && (
          <div className="flex bg-slate-100/80 p-1 rounded-xl mb-4 w-fit border border-slate-200/60 shrink-0 flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "new"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <BookPlus
                size={14}
                className={activeTab === "new" ? "text-amber-500" : "text-slate-400"}
              />
              Create New Book
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("existing")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "existing"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Copy
                size={14}
                className={activeTab === "existing" ? "text-amber-500" : "text-slate-400"}
              />
              Add Copies to Existing
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("bulk")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "bulk"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileSpreadsheet
                size={14}
                className={activeTab === "bulk" ? "text-emerald-500" : "text-slate-400"}
              />
              Bulk Import (CSV)
            </button>
          </div>
        )}

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {/* ================= MODE 1: CREATE NEW BOOK OR EDIT ================= */}
          {activeTab === "new" && (
            <form
              id="new-book-form"
              onSubmit={handleSubmit(onNewBookSubmit)}
              className="flex flex-col gap-5"
            >
              {/* Section 1: Catalog Metadata */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h3 className="text-[13px] font-extrabold text-slate-800 tracking-wide flex items-center gap-2">
                    <BookOpen size={16} className="text-amber-500" />
                    1. Catalog Metadata
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                  {/* Title (Standard Text Input - fully editable inline) */}
                  <div className="md:col-span-2">
                    <label className="text-[12px] font-bold text-slate-600 mb-1.5 block tracking-wide">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("title")}
                      placeholder="e.g. Clean Code: A Handbook of Agile Software Craftsmanship"
                      className={`w-full border rounded-lg px-3.5 py-2.5 text-[13px] text-slate-800 placeholder-slate-300 outline-none transition ${
                        errors.title
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      }`}
                    />
                    {errors.title && (
                      <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Author */}
                  <div>
                    <label className="text-[12px] font-bold text-slate-600 mb-1.5 block tracking-wide">
                      Author <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="author"
                      control={control}
                      render={({ field }) => (
                        <CreatableSelect
                          {...field}
                          options={authors}
                          isLoading={isLoadingOptions}
                          placeholder="Select or type author name..."
                          styles={customStyles}
                        />
                      )}
                    />
                    {errors.author && (
                      <p className="text-xs text-red-600 mt-1">{errors.author.message}</p>
                    )}
                  </div>

                  {/* ISBN */}
                  <div>
                    <label className="text-[12px] font-bold text-slate-600 mb-1.5 block tracking-wide">
                      ISBN <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("isbn")}
                      placeholder="e.g. 978-0132350884"
                      className={`w-full border rounded-lg px-3.5 py-2.5 text-[13px] text-slate-800 placeholder-slate-300 outline-none transition ${
                        errors.isbn
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      }`}
                    />
                    {errors.isbn && (
                      <p className="text-xs text-red-600 mt-1">{errors.isbn.message}</p>
                    )}
                  </div>

                  {/* Published Date */}
                  <div>
                    <label className="text-[12px] font-bold text-slate-600 mb-1.5 block tracking-wide">
                      Published Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register("published_date")}
                      className={`w-full border rounded-lg px-3.5 py-2.5 text-[13px] text-slate-800 placeholder-slate-300 outline-none transition ${
                        errors.published_date
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      }`}
                    />
                    {errors.published_date && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.published_date.message}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-[12px] font-bold text-slate-600 mb-1.5 block tracking-wide">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <CreatableSelect
                          {...field}
                          options={categories}
                          isLoading={isLoadingOptions}
                          placeholder="Select or type to create new..."
                          styles={customStyles}
                        />
                      )}
                    />
                    {errors.category && (
                      <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>
                    )}
                  </div>

                  {/* Publisher */}
                  <div className="md:col-span-2">
                    <label className="text-[12px] font-bold text-slate-600 mb-1.5 block tracking-wide">
                      Publisher <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="publisher"
                      control={control}
                      render={({ field }) => (
                        <CreatableSelect
                          {...field}
                          options={publishers}
                          isLoading={isLoadingOptions}
                          placeholder="Select or type to create new..."
                          styles={customStyles}
                        />
                      )}
                    />
                    {errors.publisher && (
                      <p className="text-xs text-red-600 mt-1">{errors.publisher.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Physical Inventory (Only for Creating New Books) */}
              {!bookToEdit && (
                <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm mb-2">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-[13px] font-extrabold text-slate-800 tracking-wide flex items-center gap-2">
                        <Library size={16} className="text-amber-500" />
                        2. Initial Physical Copies (Optional)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Add starting inventory now, or add copies later.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => append({ accession_number: "", shelf_location: "" })}
                      className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors border border-amber-100/50 cursor-pointer"
                    >
                      <Plus size={14} /> Add Physical Copy
                    </button>
                  </div>

                  {fields.length === 0 ? (
                    <div className="text-center py-7 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                      <p className="text-[12px] text-slate-500 font-bold mb-1">
                        No physical copies added yet.
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Click "Add Physical Copy" above if you have copies on hand.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {fields.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-amber-200/50 transition-colors group"
                        >
                          <div className="flex-1">
                            <label className="text-[12px] font-bold text-slate-600 mb-1 block tracking-wide">
                              Accession Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              {...register(`copies.${index}.accession_number`)}
                              className={`w-full border rounded-lg px-3.5 py-2.5 text-[13px] text-slate-800 placeholder-slate-300 outline-none transition bg-white ${
                                errors?.copies?.[index]?.accession_number
                                  ? "border-red-500 bg-red-50"
                                  : "border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                              }`}
                              placeholder="e.g. ACC-001"
                            />
                            {errors?.copies?.[index]?.accession_number && (
                              <p className="text-xs text-red-600 mt-1">
                                {errors.copies[index].accession_number.message}
                              </p>
                            )}
                          </div>

                          <div className="flex-1">
                            <label className="text-[12px] font-bold text-slate-600 mb-1 block tracking-wide">
                              Shelf Location
                            </label>
                            <input
                              {...register(`copies.${index}.shelf_location`)}
                              className="w-full border rounded-lg px-3.5 py-2.5 text-[13px] text-slate-800 placeholder-slate-300 outline-none transition bg-white border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                              placeholder="e.g. A1-Shelf-2"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="mt-6 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove Copy"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </form>
          )}

          {/* ================= MODE 2: ADD COPIES TO EXISTING BOOK ================= */}
          {activeTab === "existing" && !bookToEdit && (
            <div className="flex flex-col gap-5">
              {/* Step 1: Select Book */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
                <div className="mb-4 pb-3 border-b border-slate-100">
                  <h3 className="text-[13px] font-extrabold text-slate-800 tracking-wide flex items-center gap-2">
                    <BookOpen size={16} className="text-amber-500" />
                    1. Select Catalog Book
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Search and pick the book you are adding copies to.
                  </p>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-slate-600 mb-1.5 block tracking-wide">
                    Search Catalog Book <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={existingBookOptions}
                    isLoading={isLoadingOptions}
                    value={
                      selectedExistingBook
                        ? {
                            label: `${selectedExistingBook.title} (ISBN: ${selectedExistingBook.isbn})`,
                            value: selectedExistingBook.id,
                            book: selectedExistingBook,
                          }
                        : null
                    }
                    onChange={(option) => setSelectedExistingBook(option?.book || null)}
                    placeholder="Search by title, author, or ISBN..."
                    styles={customStyles}
                    isClearable
                  />
                </div>

                {/* Selected Book Summary Badge */}
                {selectedExistingBook && (
                  <div className="mt-4 p-4 bg-amber-50/60 border border-amber-200/60 rounded-xl flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                        Selected Catalog Entry
                      </span>
                      <h4 className="text-[14px] font-bold text-slate-800 mt-1.5">
                        {selectedExistingBook.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-600 mt-1">
                        <span>
                          <strong className="text-slate-700">Author:</strong>{" "}
                          {selectedExistingBook.author}
                        </span>
                        <span>
                          <strong className="text-slate-700">ISBN:</strong>{" "}
                          {selectedExistingBook.isbn}
                        </span>
                        {selectedExistingBook.category && (
                          <span>
                            <strong className="text-slate-700">Category:</strong>{" "}
                            {selectedExistingBook.category.name}
                          </span>
                        )}
                        <span>
                          <strong className="text-slate-700">Current Copies:</strong>{" "}
                          {selectedExistingBook.total_copies ?? 0}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedExistingBook(null)}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 underline ml-3 cursor-pointer shrink-0"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Add Physical Copies */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm mb-2">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-[13px] font-extrabold text-slate-800 tracking-wide flex items-center gap-2">
                      <Library size={16} className="text-amber-500" />
                      2. New Physical Copies
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Enter unique accession numbers for each physical book copy.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExistingCopy}
                    className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors border border-amber-100/50 cursor-pointer"
                  >
                    <Plus size={14} /> Add Another Copy
                  </button>
                </div>

                <div className="space-y-3">
                  {existingCopies.map((copy, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-amber-200/50 transition-colors"
                    >
                      <div className="flex-1">
                        <label className="text-[12px] font-bold text-slate-600 mb-1 block tracking-wide">
                          Accession Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={copy.accession_number}
                          onChange={(e) =>
                            handleUpdateExistingCopy(index, "accession_number", e.target.value)
                          }
                          className="w-full border rounded-lg px-3.5 py-2.5 text-[13px] text-slate-800 placeholder-slate-300 outline-none transition bg-white border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                          placeholder="e.g. ACC-101"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="text-[12px] font-bold text-slate-600 mb-1 block tracking-wide">
                          Shelf Location
                        </label>
                        <input
                          value={copy.shelf_location}
                          onChange={(e) =>
                            handleUpdateExistingCopy(index, "shelf_location", e.target.value)
                          }
                          className="w-full border rounded-lg px-3.5 py-2.5 text-[13px] text-slate-800 placeholder-slate-300 outline-none transition bg-white border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                          placeholder="e.g. A1-Shelf-2"
                        />
                      </div>

                      {existingCopies.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingCopy(index)}
                          className="mt-6 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove Copy"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= MODE 3: BULK IMPORT (CSV) ================= */}
          {activeTab === "bulk" && (
            <div className="flex flex-col gap-4">
              {/* Info & Template Banner */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-800">
                      Import from Spreadsheet
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Upload your Excel/CSV file with Title, Author, ISBN, Publisher, Quantity, and Semester. (Tip: Format the ISBN column as Text in Excel so 13-digit numbers aren't converted to scientific notation).
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer shadow-2xs"
                >
                  <Download size={13} className="text-emerald-600" /> Download Sample CSV
                </button>
              </div>

              {/* Upload Dropzone */}
              {!uploadResult && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      if (!file.name.toLowerCase().endsWith(".csv")) {
                        toast.error("Please upload a .csv file.");
                        return;
                      }
                      setSelectedFile(file);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-emerald-500 bg-emerald-50/50 scale-[0.99]"
                      : selectedFile
                      ? "border-emerald-400 bg-emerald-50/20"
                      : "border-slate-200 hover:border-emerald-400 hover:bg-slate-50/50"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (!file.name.toLowerCase().endsWith(".csv")) {
                          toast.error("Please upload a .csv file.");
                          return;
                        }
                        setSelectedFile(file);
                      }
                    }}
                  />

                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full">
                        <FileText size={28} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-slate-800">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {(selectedFile.size / 1024).toFixed(1)} KB • Ready to import
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="mt-2 text-xs font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                      >
                        Remove / Choose different file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-slate-100 text-slate-500 rounded-full">
                        <UploadCloud size={28} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-slate-800">
                          Drag & drop your CSV file here, or{" "}
                          <span className="text-emerald-600 underline">browse</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Supports UTF-8 CSV exported directly from Excel or Google Sheets.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Result Summary */}
              {uploadResult && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-slate-800">
                        Import Completed Successfully
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Processed {uploadResult.total_rows} rows from your CSV file.
                      </p>
                    </div>
                  </div>

                  {/* Summary Metric Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                        New Books Added
                      </span>
                      <span className="text-2xl font-extrabold text-emerald-800 mt-1 block">
                        {uploadResult.created_books}
                      </span>
                    </div>

                    <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                        Physical Copies Registered
                      </span>
                      <span className="text-2xl font-extrabold text-blue-800 mt-1 block">
                        {uploadResult.created_copies}
                      </span>
                    </div>

                    <div className="bg-amber-50/60 border border-amber-100 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                        Existing / Updated
                      </span>
                      <span className="text-2xl font-extrabold text-amber-800 mt-1 block">
                        {uploadResult.existing_books}
                      </span>
                    </div>
                  </div>

                  {/* Errors / Warnings List if any */}
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                        <AlertTriangle size={15} className="text-amber-600" />
                        {uploadResult.errors.length} rows were skipped due to formatting issues:
                      </div>
                      <div className="max-h-[140px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                        {uploadResult.errors.map((err, i) => (
                          <div
                            key={i}
                            className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-lg border border-amber-100/80 flex items-start justify-between gap-2"
                          >
                            <span>
                              <strong>Row {err.row}:</strong> {err.title} —{" "}
                              <span className="text-amber-700">{err.reason}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-start">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadResult(null);
                        setSelectedFile(null);
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                    >
                      ← Import another CSV file
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-3 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
          >
            Cancel
          </button>

          {activeTab === "new" ? (
            <Button
              type="submit"
              form="new-book-form"
              isLoading={isSubmitting}
              loadingText={bookToEdit ? "Saving Changes..." : "Saving Book Data..."}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold text-[13px] px-6 py-2.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {bookToEdit ? "Save Changes" : "Save Book Data"}
            </Button>
          ) : activeTab === "existing" ? (
            <Button
              type="button"
              onClick={onExistingCopiesSubmit}
              isLoading={isSubmitting}
              loadingText="Adding Copies..."
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold text-[13px] px-6 py-2.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              Add Physical Copies
            </Button>
          ) : uploadResult ? (
            <Button
              type="button"
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[13px] px-6 py-2.5 rounded-lg transition-all cursor-pointer shadow-sm"
            >
              Done & View Catalog
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleBulkUpload}
              isLoading={isUploading}
              disabled={!selectedFile || isUploading}
              loadingText="Importing Records..."
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[13px] px-6 py-2.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <UploadCloud size={16} /> Upload & Import Books
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddBookModal;
