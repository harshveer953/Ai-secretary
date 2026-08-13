import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Users,
  Calendar,
  PhoneCall,
  Sparkles,
  Clock,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { getDashboardStats } from "../services/dashboardApi";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getDashboardStats();
      if (response?.success && response?.data) {
        setStats(response.data);
      } else {
        setError("Failed to fetch dashboard data.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dashboard stats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return "0 mins";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-36 bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
          <div className="h-36 bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
          <div className="h-36 bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
          <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="apple-card p-8 rounded-3xl text-center space-y-4 max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Unable to load dashboard</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 rounded-xl text-xs font-semibold hover:opacity-90 inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden apple-card p-6 md:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 dark:border-zinc-800/80">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
              Welcome back
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Good day, {user?.fullName?.split(" ")[0] || "Executive"}
            </h1>
            <p className="text-xs md:text-sm text-zinc-300">
              Here is your AI Secretary summary for today. All systems operational.
            </p>
          </div>

          <Link
            to="/ai"
            className="self-start md:self-auto px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md text-xs font-semibold flex items-center gap-2 border border-white/20 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Launch AI Assistant</span>
          </Link>
        </div>
        {/* Subtle background graphic */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contacts Card */}
        <div className="apple-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Contacts
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {stats?.contacts?.total || 0}
            </span>
            <Link
              to="/contacts"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
            Active directory entries
          </div>
        </div>

        {/* Appointments Card */}
        <div className="apple-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Appointments
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {stats?.appointments?.total || 0}
            </span>
            <Link
              to="/appointments"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
            >
              <span>Schedule</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Scheduled: {stats?.appointments?.scheduled || 0}</span>
            <span>Today: {stats?.appointments?.today || 0}</span>
          </div>
        </div>

        {/* Calls Card */}
        <div className="apple-card p-6 rounded-3xl space-y-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Calls Logged
            </span>
            <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {stats?.calls?.total || 0}
            </span>
            <Link
              to="/calls"
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1 hover:underline"
            >
              <span>View Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Duration: {formatDuration(stats?.calls?.totalDuration)}</span>
            <span>Answered: {stats?.calls?.answered || 0}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pr-2">
          Quick Actions:
        </span>
        <Link
          to="/contacts"
          className="px-3.5 py-2 rounded-xl apple-card hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium flex items-center gap-2 text-zinc-800 dark:text-zinc-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-blue-500" />
          <span>Add Contact</span>
        </Link>
        <Link
          to="/appointments"
          className="px-3.5 py-2 rounded-xl apple-card hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium flex items-center gap-2 text-zinc-800 dark:text-zinc-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-500" />
          <span>New Appointment</span>
        </Link>
        <Link
          to="/calls"
          className="px-3.5 py-2 rounded-xl apple-card hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium flex items-center gap-2 text-zinc-800 dark:text-zinc-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-violet-500" />
          <span>Log Call</span>
        </Link>
      </div>

      {/* Recent Activity Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="apple-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                Recent Appointments
              </h3>
            </div>
            <Link
              to="/appointments"
              className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              View all
            </Link>
          </div>

          {stats?.recentAppointments && stats.recentAppointments.length > 0 ? (
            <div className="space-y-3">
              {stats.recentAppointments.map((item) => (
                <div
                  key={item._id}
                  className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {item.contact?.fullName ? `With: ${item.contact.fullName}` : "No contact specified"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300 block">
                      {new Date(item.appointmentDate).toLocaleDateString()}
                    </span>
                    <span className="inline-block text-[10px] capitalize px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-400">
              No recent appointments scheduled.
            </div>
          )}
        </div>

        {/* Recent Calls */}
        <div className="apple-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-violet-500" />
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                Recent Call Activity
              </h3>
            </div>
            <Link
              to="/calls"
              className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              View all
            </Link>
          </div>

          {stats?.recentCalls && stats.recentCalls.length > 0 ? (
            <div className="space-y-3">
              {stats.recentCalls.map((item) => (
                <div
                  key={item._id}
                  className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                      {item.contact?.fullName || "Call Record"}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 capitalize">
                      {item.callType} • {item.status}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300 block">
                      {formatDuration(item.duration)}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(item.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-400">
              No recent call records logged.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
