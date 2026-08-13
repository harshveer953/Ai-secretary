import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Plus,
  Clock,
  User,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  Check,
  FileText,
} from "lucide-react";
import {
  getCalls,
  createCall,
  updateCall,
  deleteCall,
} from "../services/callApi";
import { getContacts } from "../services/contactApi";

const Calls = () => {
  const [calls, setCalls] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCall, setEditingCall] = useState(null);
  const [deletingCall, setDeletingCall] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [callRes, contactRes] = await Promise.all([
        getCalls(),
        getContacts(),
      ]);
      if (callRes?.success && callRes?.data) {
        setCalls(callRes.data.calls || []);
      }
      if (contactRes?.success && contactRes?.data) {
        setContacts(contactRes.data.contacts || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load call log.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const handleOpenAddModal = () => {
    setEditingCall(null);
    const nowISO = new Date().toISOString().slice(0, 16);
    reset({
      contact: contacts.length > 0 ? contacts[0]._id : "",
      callType: "outgoing",
      status: "answered",
      duration: 60,
      notes: "",
      startedAt: nowISO,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (call) => {
    setEditingCall(call);
    let startISO = "";
    if (call.startedAt) {
      startISO = new Date(call.startedAt).toISOString().slice(0, 16);
    }
    reset({
      contact: call.contact?._id || call.contact || "",
      callType: call.callType || "outgoing",
      status: call.status || "answered",
      duration: call.duration || 0,
      notes: call.notes || "",
      startedAt: startISO,
    });
    setIsModalOpen(true);
  };

  const onSubmitForm = async (data) => {
    try {
      const payload = {
        ...data,
        duration: Number(data.duration) || 0,
      };

      if (editingCall) {
        await updateCall(editingCall._id, payload);
      } else {
        await createCall(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to log call.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCall) return;
    try {
      await deleteCall(deletingCall._id);
      setDeletingCall(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete call record.");
    }
  };

  const getCallIcon = (type, status) => {
    if (status === "missed") return <PhoneMissed className="w-4 h-4 text-rose-500" />;
    if (type === "incoming") return <PhoneIncoming className="w-4 h-4 text-blue-500" />;
    return <PhoneOutgoing className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Call Logs
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Log and review executive communications & conversation histories
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          disabled={contacts.length === 0}
          className="px-4 py-2.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 shadow-sm transition-all disabled:opacity-40"
          title={contacts.length === 0 ? "Please add a contact first" : ""}
        >
          <Plus className="w-4 h-4" />
          <span>Log New Call</span>
        </button>
      </div>

      {/* Calls List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-zinc-200 dark:bg-zinc-800/60 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="apple-card p-6 rounded-3xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-xs text-rose-500 font-medium">{error}</p>
        </div>
      ) : calls.length === 0 ? (
        <div className="apple-card p-12 rounded-3xl text-center space-y-3">
          <PhoneCall className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            No call records found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Log incoming and outgoing executive calls to maintain full secretary records.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {calls.map((call) => (
            <div
              key={call._id}
              className="apple-card p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  {getCallIcon(call.callType, call.status)}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                      {call.contact?.fullName || "Unlinked Contact"}
                    </h3>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {call.callType}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="capitalize font-medium text-zinc-700 dark:text-zinc-300">
                      Status: {call.status}
                    </span>
                    <span>•</span>
                    <span>Duration: {formatDuration(call.duration)}</span>
                    <span>•</span>
                    <span>{new Date(call.startedAt).toLocaleString()}</span>
                  </div>

                  {call.notes && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-0.5 line-clamp-1">
                      Note: {call.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleOpenEditModal(call)}
                  className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Edit Call Log"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeletingCall(call)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete Call Log"
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
                {editingCall ? "Edit Call Record" : "Log Call Record"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
              {/* Contact */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Select Contact *
                </label>
                <select
                  {...register("contact", { required: "Contact is required" })}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none"
                >
                  <option value="">-- Choose contact --</option>
                  {contacts.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.fullName} ({c.phone})
                    </option>
                  ))}
                </select>
                {errors.contact && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.contact.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Call Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Call Type *
                  </label>
                  <select
                    {...register("callType", { required: true })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  >
                    <option value="incoming">Incoming</option>
                    <option value="outgoing">Outgoing</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Status *
                  </label>
                  <select
                    {...register("status", { required: true })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  >
                    <option value="answered">Answered</option>
                    <option value="missed">Missed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    placeholder="60"
                    {...register("duration")}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Started At */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Started At *
                  </label>
                  <input
                    type="datetime-local"
                    {...register("startedAt", { required: "Start time is required" })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Call Notes / Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Discussed Q3 strategy..."
                  {...register("notes")}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
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
                  <span>{editingCall ? "Save Record" : "Log Call"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="apple-card w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Confirm Deletion</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Are you sure you want to delete this call record?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingCall(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calls;
