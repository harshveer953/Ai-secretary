import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Bell,
  Plus,
  Mail,
  MessageSquare,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Edit2,
  Loader2,
  Check,
} from "lucide-react";
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from "../services/reminderApi";
import { getAppointments } from "../services/appointmentApi";

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [deletingReminder, setDeletingReminder] = useState(null);

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
      const [remRes, appRes] = await Promise.all([
        getReminders(),
        getAppointments(),
      ]);
      if (remRes?.success && remRes?.data) {
        setReminders(remRes.data.reminders || []);
      }
      if (appRes?.success && appRes?.data) {
        setAppointments(appRes.data.appointments || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reminders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingReminder(null);
    const nowISO = new Date(Date.now() + 3600000).toISOString().slice(0, 16);
    reset({
      appointment: appointments.length > 0 ? appointments[0]._id : "",
      reminderType: "email",
      reminderTime: nowISO,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rem) => {
    setEditingReminder(rem);
    let timeISO = "";
    if (rem.reminderTime) {
      timeISO = new Date(rem.reminderTime).toISOString().slice(0, 16);
    }
    reset({
      appointment: rem.appointment?._id || rem.appointment || "",
      reminderType: rem.reminderType || "email",
      reminderTime: timeISO,
    });
    setIsModalOpen(true);
  };

  const onSubmitForm = async (data) => {
    try {
      if (editingReminder) {
        await updateReminder(editingReminder._id, data);
      } else {
        await createReminder(data);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save reminder.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReminder) return;
    try {
      await deleteReminder(deletingReminder._id);
      setDeletingReminder(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete reminder.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Reminders & Alerts
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Configure automatic email and WhatsApp notification alerts
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          disabled={appointments.length === 0}
          className="px-4 py-2.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 shadow-sm transition-all disabled:opacity-40"
          title={appointments.length === 0 ? "Please create an appointment first" : ""}
        >
          <Plus className="w-4 h-4" />
          <span>New Reminder</span>
        </button>
      </div>

      {appointments.length === 0 && !loading && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>You need at least one scheduled Appointment to attach reminders.</span>
        </div>
      )}

      {/* Reminders Grid */}
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
      ) : reminders.length === 0 ? (
        <div className="apple-card p-12 rounded-3xl text-center space-y-3">
          <Bell className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            No reminders scheduled
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Reminders are automatically dispatched prior to scheduled appointments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((rem) => (
            <div
              key={rem._id}
              className="apple-card p-5 rounded-3xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                        rem.reminderType === "email"
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                          : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {rem.reminderType === "email" ? (
                        <Mail className="w-4 h-4" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white capitalize">
                        {rem.reminderType} Notification
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {rem.appointment?.title || "Linked Appointment"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                      rem.sent
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}
                  >
                    {rem.sent ? "Sent" : "Pending"}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Scheduled for: {new Date(rem.reminderTime).toLocaleString()}</span>
                  </div>

                  {rem.appointment?.contact?.fullName && (
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Recipient: {rem.appointment.contact.fullName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => handleOpenEditModal(rem)}
                  className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Edit Reminder"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeletingReminder(rem)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete Reminder"
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
          <div className="apple-card w-full max-w-md p-6 rounded-3xl space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                {editingReminder ? "Edit Reminder" : "New Reminder"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
              {/* Linked Appointment */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Select Appointment *
                </label>
                <select
                  {...register("appointment", { required: "Appointment is required" })}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none"
                >
                  <option value="">-- Choose appointment --</option>
                  {appointments.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.title} ({new Date(a.appointmentDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                {errors.appointment && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.appointment.message}</p>
                )}
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Reminder Type *
                </label>
                <select
                  {...register("reminderType", { required: "Reminder type is required" })}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none"
                >
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              {/* Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Reminder Date & Time *
                </label>
                <input
                  type="datetime-local"
                  {...register("reminderTime", { required: "Reminder time is required" })}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
                {errors.reminderTime && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.reminderTime.message}</p>
                )}
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
                  <span>{editingReminder ? "Save Changes" : "Create Reminder"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="apple-card w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Confirm Deletion</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Are you sure you want to delete this reminder?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingReminder(null)}
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

export default Reminders;
