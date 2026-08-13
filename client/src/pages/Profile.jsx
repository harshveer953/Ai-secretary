import { useSelector, useDispatch } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, ShieldCheck, LogOut, Command, Key, Clock } from "lucide-react";
import { logout } from "../features/auth/authSlice";
import { logoutUser } from "../services/authApi";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore API error
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Manage your executive user profile and session security
        </p>
      </div>

      {/* User Info Header Card */}
      <div className="apple-card p-6 md:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 text-white dark:text-zinc-950 font-bold text-2xl flex items-center justify-center shadow-lg shrink-0">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="space-y-1 text-center sm:text-left min-w-0">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white truncate">
              {user?.fullName || "Executive User"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {user?.email || "No email available"}
            </p>
            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {user?.role || "USER"} ACCOUNT
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                JWT SECURED
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 space-y-1">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Full Name
            </span>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-white">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>{user?.fullName || "N/A"}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 space-y-1">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Email Address
            </span>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-white truncate">
              <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{user?.email || "N/A"}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 space-y-1">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Phone Number
            </span>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-white">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              <span>{user?.phone || "Not provided"}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 space-y-1">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Authentication Method
            </span>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>HTTP Cookie & Bearer Token</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
