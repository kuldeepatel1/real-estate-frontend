import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const userRole = user?.user_role || user?.role;
  const isAdmin = userRole === "admin";

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-lg sm:text-xl font-bold text-indigo-400">
            RealEstate
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-3 py-2 rounded-lg hover:bg-gray-800 transition text-sm">Home</Link>
            <Link to="/properties" className="px-3 py-2 rounded-lg hover:bg-gray-800 transition text-sm">Properties</Link>
            {token && (
              <>
                {isAdmin && <Link to="/admin/dashboard" className="px-3 py-2 rounded-lg hover:bg-gray-800 transition text-sm">Admin</Link>}
                <Link to="/dashboard" className="px-3 py-2 rounded-lg hover:bg-gray-800 transition text-sm">Dashboard</Link>
                <Link to="/favorites" className="px-3 py-2 rounded-lg hover:bg-gray-800 transition text-sm">Favorites</Link>
              </>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {token ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
                <span className="text-sm text-gray-400 hidden lg:block max-w-[120px] truncate">{user?.name || user?.user_name}</span>
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-sm transition">Logout</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-3 py-2 rounded-lg hover:bg-gray-800 transition text-sm">Login</Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition text-sm">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="md:hidden absolute right-0 top-16 w-80 bg-gray-900 shadow-xl z-50 max-w-[80vw]">
            <div className="p-4 space-y-2">
              <Link to="/" className="block px-4 py-2 rounded-lg hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/properties" className="block px-4 py-2 rounded-lg hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Properties</Link>
              {token && (
                <>
                  {isAdmin && <Link to="/admin/dashboard" className="block px-4 py-2 rounded-lg hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Admin</Link>}
                  <Link to="/dashboard" className="block px-4 py-2 rounded-lg hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  <Link to="/favorites" className="block px-4 py-2 rounded-lg hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Favorites</Link>
                </>
              )}
              <div className="pt-4 border-t border-gray-700 mt-4">
                {token ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">{user?.name?.charAt(0) || user?.user_name?.charAt(0) || "U"}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user?.name || user?.user_name}</p>
                        <p className="text-xs text-gray-400">{user?.email || user?.user_email}</p>
                      </div>
                    </div>
                    <button onClick={handleLogout} className="w-full mt-3 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg transition text-left flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" className="block w-full text-center px-4 py-3 rounded-lg hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                    <Link to="/register" className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 px-4 py-3 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Register</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

