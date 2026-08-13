import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Filter,
  Check,
} from "lucide-react";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} from "../services/appointmentApi";
import { getContacts } from "../services/contactApi";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [deletingAppointment, setDeletingAppointment] = useState(null);

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
      const [appRes, contactRes] = await Promise.all([
        getAppointments(),
        getContacts(),
      ]);
      if (appRes?.success && appRes?.data) {
        setAppointments(appRes.data.appointments || []);
      }
      if (contactRes?.success && contactRes?.data) {
        setContacts(contactRes.data.contacts || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingAppointment(null);
    reset({
      title: "",
      description: "",
      contact: contacts.length > 0 ? contacts[0]._id : "",
      appointmentDate: new Date().toISOString().split("T")[0],
      appointmentTime: "10:00",
      duration: 30,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app) => {
    setEditingAppointment(app);
    let dateStr = "";
    if (app.appointmentDate) {
      dateStr = new Date(app.appointmentDate).toISOString().split("T")[0];
    }
    reset({
      title: app.title || "",
      description: app.description || "",
      contact: app.contact?._id || app.contact || "",
      appointmentDate: dateStr,
      appointmentTime: app.appointmentTime || "10:00",
      duration: app.duration || 30,
    });
    setIsModalOpen(true);
  };

  const onSubmitForm = async (data) => {
    try {
      const payload = {
        ...data,
        duration: Number(data.duration) || 30,
      };

      if (editingAppointment) {
        await updateAppointment(editingAppointment._id, payload);
      } else {
        await createAppointment(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save appointment.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update appointment status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAppointment) return;
    try {
      await deleteAppointment(deletingAppointment._id);
      setDeletingAppointment(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete appointment.");
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (activeFilter === "all") return true;
    return a.status === activeFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "cancelled":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "missed":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Appointments
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Schedule, manage, and track your upcoming executive meetings
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          disabled={contacts.length === 0}
          className="px-4 py-2.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 shadow-sm transition-all disabled:opacity-40"
          title={contacts.length === 0 ? "Please create at least one contact first" : ""}
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>

      {contacts.length === 0 && !loading && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>You need to add at least one Contact before scheduling appointments.</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {["all", "scheduled", "completed", "cancelled", "missed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all shrink-0 ${
              activeFilter === tab
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                : "bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-800/60 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="apple-card p-6 rounded-3xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-xs text-rose-500 font-medium">{error}</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="apple-card p-12 rounded-3xl text-center space-y-3">
          <CalendarIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            No appointments found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            {activeFilter !== "all"
              ? `No appointments with status "${activeFilter}".`
              : "No appointments scheduled yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((app) => (
            <div
              key={app._id}
              className="apple-card p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                    {app.title}
                  </h3>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      app.status
                    )}`}
                  >
                    {app.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {app.contact?.fullName || "No contact linked"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{new Date(app.appointmentDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      {app.appointmentTime} ({app.duration || 30} mins)
                    </span>
                  </div>
                </div>

                {app.description && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 pt-1 line-clamp-2">
                    {app.description}
                  </p>
                )}
              </div>

              {/* Status Action & Edit Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {/* Status Dropdown */}
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app._id, e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 focus:outline-none"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="missed">Missed</option>
                </select>

                <button
                  onClick={() => handleOpenEditModal(app)}
                  className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Edit Appointment"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeletingAppointment(app)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete Appointment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="apple-card w-full max-w-lg p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                {editingAppointment ? "Edit Appointment" : "New Appointment"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Appointment Title *
                </label>
                <input
                  type="text"
                  placeholder="Board Meeting / Product Demo"
                  {...register("title", {
                    required: "Title is required",
                    minLength: { value: 2, message: "Min 2 characters" },
                  })}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                />
                {errors.title && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.title.message}</p>
                )}
              </div>

              {/* Contact Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Select Contact *
                </label>
                <select
                  {...register("contact", { required: "Contact is required" })}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                >
                  <option value="">-- Choose a contact --</option>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Date *
                  </label>
                  <input
                    type="date"
                    {...register("appointmentDate", { required: "Date is required" })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                  {errors.appointmentDate && (
                    <p className="text-[11px] text-rose-500 font-medium">{errors.appointmentDate.message}</p>
                  )}
                </div>

                {/* Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Time *
                  </label>
                  <input
                    type="time"
                    {...register("appointmentTime", { required: "Time is required" })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                  {errors.appointmentTime && (
                    <p className="text-[11px] text-rose-500 font-medium">{errors.appointmentTime.message}</p>
                  )}
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    placeholder="30"
                    {...register("duration")}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Description / Agenda
                </label>
                <textarea
                  rows={3}
                  placeholder="Meeting agenda and notes..."
                  {...register("description")}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
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
                  <span>{editingAppointment ? "Save Changes" : "Schedule Appointment"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="apple-card w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Confirm Deletion</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Are you sure you want to delete appointment <strong>{deletingAppointment.title}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingAppointment(null)}
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

export default Appointments;
