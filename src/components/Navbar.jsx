import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Check role - support both user_role (database) and role (normalized)
  const userRole = user?.user_role || user?.role;
  const isAdmin = userRole === "admin";

  return (
    <nav className="bg-gray-900 text-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-indigo-400">
          RealEstate
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-indigo-400 transition">
            Home
          </Link>
          <Link to="/properties" className="hover:text-indigo-400 transition">
            Properties
          </Link>

          {token ? (
            <>
              {isAdmin && (
                <Link to="/admin/dashboard" className="hover:text-indigo-400 transition">
                  Admin
                </Link>
              )}
              <Link to="/dashboard" className="hover:text-indigo-400 transition">
                Dashboard
              </Link>
              <Link to="/favorites" className="hover:text-indigo-400 transition">
                Favorites
              </Link>
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
                <span className="text-sm text-gray-400">
                  Hi, {user?.name || user?.user_name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="hover:text-indigo-400 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

