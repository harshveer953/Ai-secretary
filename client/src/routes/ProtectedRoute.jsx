import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser } from "../services/authApi";
import { setUser, logout } from "../features/auth/authSlice";
import { Command } from "lucide-react";

const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [checkingAuth, setCheckingAuth] = useState(!user && !isAuthenticated);

  useEffect(() => {
    let isMounted = true;
    const verifyAuth = async () => {
      if (!user && !isAuthenticated) {
        try {
          const response = await getCurrentUser();
          if (isMounted && response?.data) {
            dispatch(setUser(response.data));
          }
        } catch {
          if (isMounted) {
            dispatch(logout());
          }
        } finally {
          if (isMounted) {
            setCheckingAuth(false);
          }
        }
      } else {
        setCheckingAuth(false);
      }
    };

    verifyAuth();
    return () => {
      isMounted = false;
    };
  }, [dispatch, isAuthenticated, user]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7] dark:bg-black text-zinc-900 dark:text-white">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center animate-bounce shadow-xl">
          <Command className="w-6 h-6" />
        </div>
        <p className="mt-4 text-xs font-medium text-zinc-500 tracking-wide uppercase">
          Authenticating...
        </p>
      </div>
    );
  }

  if (!isAuthenticated && !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
