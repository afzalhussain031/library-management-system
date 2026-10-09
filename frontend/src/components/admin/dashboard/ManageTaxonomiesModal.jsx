import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  Building2,
  Folder,
  User,
  AlertCircle,
  Loader2,
  Filter,
} from "lucide-react";
import { catalog } from "../../../services/api";
import { toast } from "react-hot-toast";

const extractErrorMessage = (error, fallback) => {
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    if (data.name) return Array.isArray(data.name) ? data.name[0] : data.name;
    const firstVal = Object.values(data)[0];
    if (Array.isArray(firstVal) && firstVal.length > 0) return firstVal[0];
    if (typeof firstVal === "string") return firstVal;
  }
  return error.message || fallback;
};

const ManageTaxonomiesModal = ({
  isOpen,
  onClose,
  onUpdate,
  books = [],
  onFilterAuthor,
}) => {
  const [activeTab, setActiveTab] = useState("categories"); // "categories" | "publishers" | "authors"
  const [searchQuery, setSearchQuery] = useState("");

  // Data states
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // New item creation state
  const [newName, setNewName] = useState("");
  const [newMeta, setNewMeta] = useState(""); // description for category, address for publisher
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Defensive delete state
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTaxonomies();
      setSearchQuery("");
      setEditingId(null);
      setPendingDeleteId(null);
      setNewName("");
      setNewMeta("");
    }
  }, [isOpen]);

  const fetchTaxonomies = async () => {
    setIsLoadingData(true);
    try {
      const [catRes, pubRes] = await Promise.all([
        catalog.getCategories(),
        catalog.getPublishers(),
      ]);
      setCategories(catRes.data || []);
      setPublishers(pubRes.data || []);
    } catch (err) {
      toast.error("Failed to load categories and publishers.");
    } finally {
      setIsLoadingData(false);
    }
  };

  // Compute Authors list with book counts from the loaded books array
  const authorsList = useMemo(() => {
    const counts = {};
    books.forEach((b) => {
      const author = b.author?.trim();
      if (author) {
        counts[author] = (counts[author] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, books_count: count }))
      .sort((a, b) => b.books_count - a.books_count || a.name.localeCompare(b.name));
  }, [books]);

  // Filtered lists based on search
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  const filteredPublishers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return publishers;
    return publishers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.address && p.address.toLowerCase().includes(q))
    );
  }, [publishers, searchQuery]);

  const filteredAuthors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return authorsList;
    return authorsList.filter((a) => a.name.toLowerCase().includes(q));
  }, [authorsList, searchQuery]);

  // Handle Create
  const handleCreate = async (e) => {
    e.preventDefault();
    const cleanName = newName.trim();
    if (!cleanName) return;

    setIsSubmitting(true);
    try {
      if (activeTab === "categories") {
        const res = await catalog.createCategory({
          name: cleanName,
          description: newMeta.trim(),
        });
        setCategories((prev) => [...prev, { ...res.data, books_count: 0 }]);
        toast.success(`Category "${cleanName}" created!`);
      } else if (activeTab === "publishers") {
        const res = await catalog.createPublisher({
          name: cleanName,
          address: newMeta.trim(),
        });
        setPublishers((prev) => [...prev, { ...res.data, books_count: 0 }]);
        toast.success(`Publisher "${cleanName}" created!`);
      }
      setNewName("");
      setNewMeta("");
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(
        extractErrorMessage(
          err,
          `Failed to create ${activeTab === "categories" ? "category" : "publisher"}.`
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Start Edit
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setPendingDeleteId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  // Handle Save Edit
  const handleSaveEdit = async (id) => {
    const cleanName = editName.trim();
    if (!cleanName) return;

    setIsSavingEdit(true);
    try {
      if (activeTab === "categories") {
        const res = await catalog.updateCategory(id, { name: cleanName });
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...res.data } : c))
        );
        toast.success("Category updated successfully!");
      } else if (activeTab === "publishers") {
        const res = await catalog.updatePublisher(id, { name: cleanName });
        setPublishers((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...res.data } : p))
        );
        toast.success("Publisher updated successfully!");
      }
      setEditingId(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to update item."));
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async (item) => {
    setIsDeleting(true);
    try {
      if (activeTab === "categories") {
        await catalog.deleteCategory(item.id);
        setCategories((prev) => prev.filter((c) => c.id !== item.id));
        toast.success(`Category "${item.name}" deleted.`);
      } else if (activeTab === "publishers") {
        await catalog.deletePublisher(item.id);
        setPublishers((prev) => prev.filter((p) => p.id !== item.id));
        toast.success(`Publisher "${item.name}" deleted.`);
      }
      setPendingDeleteId(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to delete item."));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col border border-gray-100 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Manage Taxonomies
            </h2>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Organize, edit, or remove catalog categories, publishers, and view authors.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher & Search */}
        <div className="p-6 pb-3 space-y-4 bg-gray-50/50">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Pill Tabs */}
            <div className="flex items-center bg-gray-200/70 p-1 rounded-full text-[13px] font-bold">
              <button
                onClick={() => {
                  setActiveTab("categories");
                  setEditingId(null);
                  setPendingDeleteId(null);
                }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all ${
                  activeTab === "categories"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Folder size={14} className={activeTab === "categories" ? "text-amber-500" : ""} />
                Categories
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-600 font-extrabold">
                  {categories.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("publishers");
                  setEditingId(null);
                  setPendingDeleteId(null);
                }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all ${
                  activeTab === "publishers"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Building2 size={14} className={activeTab === "publishers" ? "text-blue-500" : ""} />
                Publishers
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-600 font-extrabold">
                  {publishers.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("authors");
                  setEditingId(null);
                  setPendingDeleteId(null);
                }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all ${
                  activeTab === "authors"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <User size={14} className={activeTab === "authors" ? "text-purple-500" : ""} />
                Authors
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-600 font-extrabold">
                  {authorsList.length}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-full text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all placeholder:text-gray-400 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Inline Add Bar for Categories & Publishers */}
          {activeTab !== "authors" && (
            <form
              onSubmit={handleCreate}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={`+ Add new ${activeTab === "categories" ? "category" : "publisher"} name...`}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-full text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all placeholder:text-gray-400 shadow-sm"
              />
              <button
                type="submit"
                disabled={!newName.trim() || isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#1C2434] text-white rounded-full text-[13px] font-bold hover:bg-black transition-all disabled:opacity-40 disabled:pointer-events-none shadow-sm shrink-0"
              >
                {isSubmitting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Plus size={15} />
                )}
                Add
              </button>
            </form>
          )}
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5 min-h-[300px]">
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-3">
              <Loader2 size={28} className="animate-spin text-amber-500" />
              <p className="text-[13px] font-medium">Loading catalog data...</p>
            </div>
          ) : activeTab === "categories" ? (
            filteredCategories.length === 0 ? (
              <div className="text-center py-14 text-gray-400 space-y-1">
                <Folder size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-[14px] font-semibold text-gray-600">
                  {searchQuery ? "No matching categories" : "No categories yet"}
                </p>
                <p className="text-[12px]">
                  {searchQuery ? "Try searching for something else." : "Add your first category using the input above."}
                </p>
              </div>
            ) : (
              filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3.5 px-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-sm transition-all group"
                >
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-[13px] font-bold text-gray-900 border border-amber-400 rounded-xl focus:outline-none ring-2 ring-amber-400/20"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(cat.id)}
                        disabled={isSavingEdit || !editName.trim()}
                        className="p-1.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                        title="Save"
                      >
                        <Check size={15} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                        title="Cancel"
                      >
                        <X size={15} strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 text-amber-600">
                        <Folder size={16} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[13px] font-bold text-gray-900 truncate">
                          {cat.name}
                        </h4>
                        {cat.description && (
                          <p className="text-[11px] text-gray-400 truncate">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {editingId !== cat.id && (
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Books count badge */}
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          (cat.books_count || 0) > 0
                            ? "bg-blue-50 text-[#4386F5]"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {cat.books_count || 0} {cat.books_count === 1 ? "book" : "books"}
                      </span>

                      {/* Action buttons */}
                      {pendingDeleteId === cat.id ? (
                        <div className="flex items-center gap-1.5 animate-in zoom-in-95 duration-150 bg-red-50 p-1 pl-2 rounded-full border border-red-100">
                          <span className="text-[10px] font-extrabold text-[#F64E60] uppercase pr-1">
                            {cat.books_count > 0 ? `Unlink ${cat.books_count}b?` : "Delete?"}
                          </span>
                          <button
                            onClick={() => handleDeleteConfirm(cat)}
                            disabled={isDeleting}
                            className="p-1 rounded-full bg-[#FFE2E5] text-[#F64E60] hover:bg-[#F64E60] hover:text-white transition-all"
                            title="Confirm Delete"
                          >
                            <Check size={13} strokeWidth={3} />
                          </button>
                          <button
                            onClick={() => setPendingDeleteId(null)}
                            className="p-1 rounded-full bg-white text-gray-500 hover:bg-gray-200 transition-all"
                            title="Cancel"
                          >
                            <X size={13} strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleStartEdit(cat)}
                            className="p-1.5 text-gray-400 hover:text-[#4386F5] hover:bg-blue-50 rounded-lg transition-colors"
                            title="Rename Category"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setPendingDeleteId(cat.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )
          ) : activeTab === "publishers" ? (
            filteredPublishers.length === 0 ? (
              <div className="text-center py-14 text-gray-400 space-y-1">
                <Building2 size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-[14px] font-semibold text-gray-600">
                  {searchQuery ? "No matching publishers" : "No publishers yet"}
                </p>
                <p className="text-[12px]">
                  {searchQuery ? "Try searching for something else." : "Add your first publisher using the input above."}
                </p>
              </div>
            ) : (
              filteredPublishers.map((pub) => (
                <div
                  key={pub.id}
                  className="flex items-center justify-between p-3.5 px-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-sm transition-all group"
                >
                  {editingId === pub.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-[13px] font-bold text-gray-900 border border-blue-400 rounded-xl focus:outline-none ring-2 ring-blue-400/20"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(pub.id)}
                        disabled={isSavingEdit || !editName.trim()}
                        className="p-1.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                        title="Save"
                      >
                        <Check size={15} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                        title="Cancel"
                      >
                        <X size={15} strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                        <Building2 size={16} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[13px] font-bold text-gray-900 truncate">
                          {pub.name}
                        </h4>
                        {pub.address && (
                          <p className="text-[11px] text-gray-400 truncate">
                            {pub.address}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {editingId !== pub.id && (
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          (pub.books_count || 0) > 0
                            ? "bg-blue-50 text-[#4386F5]"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {pub.books_count || 0} {pub.books_count === 1 ? "book" : "books"}
                      </span>

                      {pendingDeleteId === pub.id ? (
                        <div className="flex items-center gap-1.5 animate-in zoom-in-95 duration-150 bg-red-50 p-1 pl-2 rounded-full border border-red-100">
                          <span className="text-[10px] font-extrabold text-[#F64E60] uppercase pr-1">
                            {pub.books_count > 0 ? `Unlink ${pub.books_count}b?` : "Delete?"}
                          </span>
                          <button
                            onClick={() => handleDeleteConfirm(pub)}
                            disabled={isDeleting}
                            className="p-1 rounded-full bg-[#FFE2E5] text-[#F64E60] hover:bg-[#F64E60] hover:text-white transition-all"
                            title="Confirm Delete"
                          >
                            <Check size={13} strokeWidth={3} />
                          </button>
                          <button
                            onClick={() => setPendingDeleteId(null)}
                            className="p-1 rounded-full bg-white text-gray-500 hover:bg-gray-200 transition-all"
                            title="Cancel"
                          >
                            <X size={13} strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleStartEdit(pub)}
                            className="p-1.5 text-gray-400 hover:text-[#4386F5] hover:bg-blue-50 rounded-lg transition-colors"
                            title="Rename Publisher"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setPendingDeleteId(pub.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Publisher"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )
          ) : (
            /* Authors Tab */
            filteredAuthors.length === 0 ? (
              <div className="text-center py-14 text-gray-400 space-y-1">
                <User size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-[14px] font-semibold text-gray-600">
                  {searchQuery ? "No matching authors" : "No authors recorded"}
                </p>
                <p className="text-[12px]">
                  Authors are automatically recorded whenever you add books to the catalog.
                </p>
              </div>
            ) : (
              filteredAuthors.map((author, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 px-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 text-purple-600">
                      <User size={16} />
                    </div>
                    <h4 className="text-[13px] font-bold text-gray-900 truncate">
                      {author.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
                      {author.books_count} {author.books_count === 1 ? "book" : "books"}
                    </span>

                    {onFilterAuthor && (
                      <button
                        onClick={() => {
                          onFilterAuthor(author.name);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-[11px] font-bold transition-colors"
                        title={`Filter books by ${author.name}`}
                      >
                        <Filter size={11} />
                        Filter
                      </button>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <AlertCircle size={13} className="text-amber-500 shrink-0" />
            <span>
              Renaming a category or publisher immediately updates all books linked to it.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-full text-[12px] font-bold transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageTaxonomiesModal;
