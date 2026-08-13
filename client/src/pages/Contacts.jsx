import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Users,
  Plus,
  Search,
  Star,
  Edit2,
  Trash2,
  X,
  Mail,
  Phone,
  Building,
  Briefcase,
  FileText,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  toggleFavoriteContact,
} from "../services/contactApi";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const fetchContactsList = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getContacts();
      if (response?.success && response?.data) {
        setContacts(response.data.contacts || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactsList();
  }, []);

  const handleOpenAddModal = () => {
    setEditingContact(null);
    reset({
      fullName: "",
      phone: "",
      email: "",
      company: "",
      designation: "",
      notes: "",
      isFavorite: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (contact) => {
    setEditingContact(contact);
    reset({
      fullName: contact.fullName || "",
      phone: contact.phone || "",
      email: contact.email || "",
      company: contact.company || "",
      designation: contact.designation || "",
      notes: contact.notes || "",
      isFavorite: contact.isFavorite || false,
    });
    setIsModalOpen(true);
  };

  const onSubmitForm = async (data) => {
    try {
      if (editingContact) {
        await updateContact(editingContact._id, data);
      } else {
        await createContact(data);
      }
      setIsModalOpen(false);
      fetchContactsList();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving contact.");
    }
  };

  const handleToggleFavorite = async (contact) => {
    try {
      const updatedStatus = !contact.isFavorite;
      await toggleFavoriteContact(contact._id, updatedStatus);
      setContacts((prev) =>
        prev.map((c) => (c._id === contact._id ? { ...c, isFavorite: updatedStatus } : c))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Could not update favorite status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingContact) return;
    try {
      await deleteContact(deletingContact._id);
      setDeletingContact(null);
      fetchContactsList();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete contact.");
    }
  };

  // Client-side search and favorite filter
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.phone.includes(searchTerm) ||
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFav = showFavoritesOnly ? c.isFavorite : true;
    return matchesSearch && matchesFav;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Contacts
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Manage your personal and executive business connections
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Contact</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search contacts by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all shadow-sm"
          />
        </div>

        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
            showFavoritesOnly
              ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
              : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? "fill-amber-400 text-amber-400" : ""}`} />
          <span>Favorites Only</span>
        </button>
      </div>

      {/* Contacts List / Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-zinc-200 dark:bg-zinc-800/60 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="apple-card p-6 rounded-3xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-xs text-rose-500 font-medium">{error}</p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="apple-card p-12 rounded-3xl text-center space-y-3">
          <Users className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            No contacts found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            {searchTerm || showFavoritesOnly
              ? "No contacts match your current filter query."
              : "Your contacts list is empty. Click below to add your first contact."}
          </p>
          {!searchTerm && !showFavoritesOnly && (
            <button
              onClick={handleOpenAddModal}
              className="mt-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Contact</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((c) => (
            <div
              key={c._id}
              className="apple-card p-5 rounded-3xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-sm flex items-center justify-center shrink-0">
                      {c.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {c.fullName}
                      </h3>
                      {c.designation || c.company ? (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {c.designation} {c.designation && c.company ? "at" : ""} {c.company}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFavorite(c)}
                    className="p-1.5 text-zinc-400 hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        c.isFavorite ? "fill-amber-400 text-amber-400" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{c.phone}</span>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.notes && (
                    <div className="flex items-start gap-2 text-[11px] text-zinc-400 pt-1">
                      <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{c.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => handleOpenEditModal(c)}
                  className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Edit Contact"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeletingContact(c)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete Contact"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="apple-card w-full max-w-lg p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                {editingContact ? "Edit Contact" : "Create New Contact"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Tim Cook"
                    {...register("fullName", {
                      required: "Full name is required",
                      minLength: { value: 2, message: "Min 2 characters" },
                    })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-rose-500 font-medium">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Phone *
                  </label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    {...register("phone", {
                      required: "Phone number is required",
                      minLength: { value: 10, message: "Min 10 digits" },
                    })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-rose-500 font-medium">{errors.phone.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="tim@apple.com"
                    {...register("email")}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>

                {/* Company */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Company
                  </label>
                  <input
                    type="text"
                    placeholder="Apple Inc."
                    {...register("company")}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>

                {/* Designation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Designation
                  </label>
                  <input
                    type="text"
                    placeholder="CEO"
                    {...register("designation")}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Key executive contact..."
                    {...register("notes")}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 inline-flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingContact ? "Save Changes" : "Create Contact"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="apple-card w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Confirm Deletion</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Are you sure you want to delete contact <strong>{deletingContact.fullName}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingContact(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                Delete Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
