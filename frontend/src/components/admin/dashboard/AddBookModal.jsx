import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Trash2, Loader2, Info } from "lucide-react";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-hot-toast";
import { catalog, inventory } from "../../../services/api";

const schema = z.object({
  title: z
    .object({ label: z.string(), value: z.union([z.string(), z.number()]), __isNew__: z.boolean().optional() })
    .nullable()
    .refine((val) => val !== null, { message: "Title is required" }),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().min(1, "ISBN is required"),
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
      accession_number: z.string().min(1, "Accession number is required"),
      shelf_location: z.string().optional(),
    })
  ),
});

const AddBookModal = ({ isOpen, onClose, onSuccess }) => {
  const [booksList, setBooksList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExistingBook, setIsExistingBook] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: null,
      author: "",
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

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      reset();
      setIsExistingBook(false);
    }
  }, [isOpen]);

  const fetchOptions = async () => {
    setIsLoadingOptions(true);
    try {
      const [bookRes, catRes, pubRes] = await Promise.all([
        catalog.getBooks(),
        catalog.getCategories(),
        catalog.getPublishers(),
      ]);
      setBooksList(bookRes.data || []);
      setCategories(catRes.data.map((c) => ({ label: c.name, value: c.id })));
      setPublishers(pubRes.data.map((p) => ({ label: p.name, value: p.id })));
    } catch (error) {
      console.error("Failed to fetch options", error);
      toast.error("Failed to load catalog data");
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const handleTitleChange = (selectedOption) => {
    setValue("title", selectedOption, { shouldValidate: true });
    
    if (selectedOption && !selectedOption.__isNew__) {
      // Existing book selected
      const book = booksList.find((b) => b.id === selectedOption.value);
      if (book) {
        setValue("author", book.author);
        setValue("isbn", book.isbn);
        setValue("published_date", book.published_date);
        if (book.category) {
          setValue("category", { label: book.category.name, value: book.category.id });
        } else {
            setValue("category", null);
        }
        if (book.publisher) {
          setValue("publisher", { label: book.publisher.name, value: book.publisher.id });
        } else {
            setValue("publisher", null);
        }
        setIsExistingBook(true);
      }
    } else {
      // New book
      setIsExistingBook(false);
      setValue("author", "");
      setValue("isbn", "");
      setValue("published_date", "");
      setValue("category", null);
      setValue("publisher", null);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let bookId = null;

      if (isExistingBook) {
        // Option 1: Adding copies to an existing book
        bookId = data.title.value;
      } else {
        // Option 2: Creating a brand new book
        let categoryId = data.category.value;
        let publisherId = data.publisher.value;

        // Create Category if it's new
        if (data.category.__isNew__) {
          const res = await catalog.createCategory({ name: data.category.label });
          categoryId = res.data.id;
        }

        // Create Publisher if it's new
        if (data.publisher.__isNew__) {
          const res = await catalog.createPublisher({ name: data.publisher.label });
          publisherId = res.data.id;
        }

        // Create the Book
        const bookData = {
          title: data.title.label,
          author: data.author,
          isbn: data.isbn,
          published_date: data.published_date,
          category_id: categoryId,
          publisher_id: publisherId,
        };
        const bookRes = await catalog.addBook(bookData);
        bookId = bookRes.data.id;
      }

      // Create Physical Copies if any
      if (data.copies.length > 0) {
        const copyPromises = data.copies.map((copy) =>
          inventory.addBookCopy({
            book: bookId,
            accession_number: copy.accession_number,
            shelf_location: copy.shelf_location || "",
          })
        );
        await Promise.all(copyPromises);
      } else if (isExistingBook) {
          // If they selected an existing book but added no copies, there's nothing to do
          toast.success("No physical copies were added to the existing book.");
          onClose();
          return;
      }

      toast.success(isExistingBook ? "Physical copies added successfully!" : "Book and copies added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save data", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.accession_number?.[0] ||
          "Failed to process request. Check if Accession Numbers are unique."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#FBBF24' : '#E2E8F0', // amber-400 and slate-200
      boxShadow: state.isFocused ? '0 0 0 1px #FBBF24' : 'none',
      backgroundColor: state.isDisabled ? '#F8FAFC' : 'white', // slate-50
      '&:hover': {
        borderColor: state.isFocused ? '#FBBF24' : '#CBD5E1' // amber-400 and slate-300
      },
      borderRadius: '0.5rem',
      padding: '0.125rem',
      fontSize: '12px', // text-xs
      color: '#1E293B', // slate-800
    }),
    singleValue: (base, state) => ({
      ...base,
      color: state.isDisabled ? '#94A3B8' : '#1E293B', // slate-400 and slate-800
    }),
    placeholder: (base) => ({
      ...base,
      color: '#CBD5E1', // slate-300
    }),
  };

  // Prepare existing books for the dropdown
  const bookOptions = booksList.map(b => ({
      label: `${b.title} (ISBN: ${b.isbn})`,
      value: b.id
  }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 animate-[fadeIn_0.15s_ease-out] p-4">
      <div 
        className="bg-white rounded-[26px] p-6 w-full max-w-4xl shadow-2xl border border-amber-100/10 flex flex-col relative max-h-[92vh] transform transition-all duration-150 animate-[scaleUp_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 mt-1 shrink-0">
          <div>
            <h2 className="text-[18px] font-extrabold text-slate-800">Add Book or Copies</h2>
            <p className="text-[12px] font-medium text-slate-500 mt-1 tracking-wide">Search for an existing book to add copies, or type a new title.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all duration-150 cursor-pointer"
            aria-label="Close Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <form id="add-book-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            
            {/* Section A: Catalog Metadata */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-[13px] font-extrabold text-slate-800 tracking-wide">
                  1. Catalog Metadata
                </h3>
                {isExistingBook && (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md tracking-wider uppercase">
                        <Info size={12} /> Read-Only Mode
                    </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                {/* Title (Creatable Select) */}
                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 mb-1.5 block tracking-wide">Search by Title or ISBN (or type Title to create new)</label>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <CreatableSelect
                        {...field}
                        options={bookOptions}
                        isLoading={isLoadingOptions}
                        onChange={handleTitleChange}
                        placeholder="Search existing title/ISBN or type a new title..."
                        styles={customStyles}
                        formatCreateLabel={(inputValue) => `Create new catalog entry for "${inputValue}"`}
                      />
                    )}
                  />
                  {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
                </div>

                {/* Author */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1.5 block tracking-wide">Author</label>
                  <input
                    {...register("author")}
                    disabled={isExistingBook}
                    className={`w-full border rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-300 outline-none transition disabled:bg-slate-50 disabled:text-slate-400 ${errors.author ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'}`}
                    placeholder="Enter author name"
                  />
                  {errors.author && <p className="text-xs text-red-600 mt-1">{errors.author.message}</p>}
                </div>

                {/* ISBN */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1.5 block tracking-wide">ISBN</label>
                  <input
                    {...register("isbn")}
                    disabled={isExistingBook}
                    className={`w-full border rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-300 outline-none transition disabled:bg-slate-50 disabled:text-slate-400 ${errors.isbn ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'}`}
                    placeholder="e.g. 9781234567897"
                  />
                  {errors.isbn && <p className="text-xs text-red-600 mt-1">{errors.isbn.message}</p>}
                </div>

                {/* Published Date */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1.5 block tracking-wide">Published Date</label>
                  <input
                    type="date"
                    {...register("published_date")}
                    disabled={isExistingBook}
                    className={`w-full border rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-300 outline-none transition disabled:bg-slate-50 disabled:text-slate-400 ${errors.published_date ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'}`}
                  />
                  {errors.published_date && <p className="text-xs text-red-600 mt-1">{errors.published_date.message}</p>}
                </div>

                {/* Category (Creatable Select) */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1.5 block tracking-wide">Category</label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <CreatableSelect
                        {...field}
                        isDisabled={isExistingBook}
                        options={categories}
                        isLoading={isLoadingOptions}
                        placeholder="Select or type to create new..."
                        styles={customStyles}
                        formatCreateLabel={(inputValue) => `Create new category "${inputValue}"`}
                      />
                    )}
                  />
                  {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>}
                </div>

                {/* Publisher (Creatable Select) */}
                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 mb-1.5 block tracking-wide">Publisher</label>
                  <Controller
                    name="publisher"
                    control={control}
                    render={({ field }) => (
                      <CreatableSelect
                        {...field}
                        isDisabled={isExistingBook}
                        options={publishers}
                        isLoading={isLoadingOptions}
                        placeholder="Select or type to create new..."
                        styles={customStyles}
                        formatCreateLabel={(inputValue) => `Create new publisher "${inputValue}"`}
                      />
                    )}
                  />
                  {errors.publisher && <p className="text-xs text-red-600 mt-1">{errors.publisher.message}</p>}
                </div>
              </div>
            </div>

            {/* Section B: Physical Inventory */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm mb-2">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-[13px] font-extrabold text-slate-800 tracking-wide">
                  2. Physical Inventory
                </h3>
                <button
                  type="button"
                  onClick={() => append({ accession_number: "", shelf_location: "" })}
                  className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors border border-amber-100/50"
                >
                  <Plus size={14} /> Add Physical Copy
                </button>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-[12px] text-slate-500 font-bold mb-1 tracking-wide">No physical copies added yet.</p>
                  <p className="text-[11px] text-slate-400">You can add physical copies now or later from the inventory page.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-amber-200/50 transition-colors group">
                      <div className="flex-1">
                        <label className="text-[11px] font-bold text-slate-500 mb-1 block tracking-wide">Accession Number *</label>
                        <input
                          {...register(`copies.${index}.accession_number`)}
                          className={`w-full border rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-300 outline-none transition bg-white ${errors.copies?.[index]?.accession_number ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'}`}
                          placeholder="e.g. ACC-001"
                        />
                        {errors.copies?.[index]?.accession_number && <p className="text-xs text-red-600 mt-1">{errors.copies[index].accession_number.message}</p>}
                      </div>
                      
                      <div className="flex-1">
                        <label className="text-[11px] font-bold text-slate-500 mb-1 block tracking-wide">Shelf Location</label>
                        <input
                          {...register(`copies.${index}.shelf_location`)}
                          className="w-full border rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-300 outline-none transition bg-white border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                          placeholder="e.g. A1-Shelf-2"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="mt-6 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100"
                        title="Remove copy"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-2 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-book-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-200 disabled:text-gray-400 text-slate-900 font-bold text-[13px] px-6 py-2.5 rounded-lg transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving...
              </>
            ) : (
              "Save Book Data"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBookModal;
