import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";

export default function AuthWatcher() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);

  useEffect(() => {
    // If localStorage token is removed (e.g., by interceptor), sync logout
    const checkAndLogout = () => {
      const stored = localStorage.getItem("token");
      if (!stored && token) {
        dispatch(logout());
        navigate("/login", { replace: true });
      }
    };

    // initial check
    checkAndLogout();

    const onStorage = (e) => {
      try {
        const loginAt = Number(localStorage.getItem("auth:loginAt") || 0);
        const now = Date.now();

        // If token explicitly removed
        if (e.key === "token" && !e.newValue) {
          // If token removal happened immediately after login, delay to avoid race
          if (now - loginAt < 1500) {
            setTimeout(() => {
              const still = localStorage.getItem("token");
              if (!still) {
                dispatch(logout());
                navigate("/login", { replace: true });
              }
            }, 1200);
            return;
          }
          dispatch(logout());
          navigate("/login", { replace: true });
        }

        if (e.key === "auth:expired") {
          // If expiry flagged right after login, wait briefly then re-check
          if (now - loginAt < 1500) {
            setTimeout(() => {
              const still = localStorage.getItem("token");
              if (!still) {
                dispatch(logout());
                navigate("/login", { replace: true });
              }
            }, 1200);
            return;
          }
          dispatch(logout());
          navigate("/login", { replace: true });
        }
      } catch (err) {
        // fallback: immediate logout
        if (e.key === "token" && !e.newValue) {
          dispatch(logout());
          navigate("/login", { replace: true });
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [dispatch, navigate, token]);

  return null;
}
