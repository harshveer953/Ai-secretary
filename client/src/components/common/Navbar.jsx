import { useState } from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Menu,
  X,
  Sparkles,
  Command,
  LayoutDashboard,
  Users,
  Calendar,
  Bell,
  PhoneCall,
  User,
  LogOut,
} from "lucide-react";
import { logout } from "../../features/auth/authSlice";
import { logoutUser } from "../../services/authApi";

const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore API errors on logout
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("dashboard")) return "Dashboard Overview";
    if (path.includes("contacts")) return "Contacts & Leads";
    if (path.includes("appointments")) return "Schedule & Appointments";
    if (path.includes("reminders")) return "Reminders & Alerts";
    if (path.includes("calls")) return "Call Logs";
    if (path.includes("ai")) return "Apple Intelligence Assistant";
    if (path.includes("profile")) return "Account Settings";
    return "AI Secretary";
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Contacts", path: "/contacts", icon: Users },
    { name: "Appointments", path: "/appointments", icon: Calendar },
    { name: "Reminders", path: "/reminders", icon: Bell },
    { name: "Calls", path: "/calls", icon: PhoneCall },
    { name: "AI Assistant", path: "/ai", icon: Sparkles },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-20 apple-glass border-b border-zinc-200/60 dark:border-zinc-800/60 px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center">
            <Command className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-zinc-900 dark:text-white">
            AI Secretary
          </span>
        </div>

        <h2 className="hidden md:block text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
          {getPageTitle()}
        </h2>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <NavLink
          to="/ai"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 dark:from-zinc-100 dark:via-white dark:to-zinc-100 text-white dark:text-zinc-950 hover:opacity-90 transition-all duration-200 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 dark:text-amber-500 animate-pulse" />
          <span className="hidden sm:inline">Ask AI Assistant</span>
          <span className="sm:hidden">AI</span>
        </NavLink>

        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-medium text-xs text-zinc-800 dark:text-zinc-200">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border-b border-zinc-200 dark:border-zinc-800 p-4 space-y-1 shadow-2xl transition-all">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          <div className="pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
