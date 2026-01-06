import { useEffect, useState } from "react";
// import AdminLayout from "../components/AdminLayout";
import { useDispatch } from "react-redux";
import { fetchProfile } from "../redux/slices/authSlice";
import { getAllUsers } from "../services/authService";

export default function AdminUsers() {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
    loadUsers();
  }, [dispatch]);

  const loadUsers = async () => {
    try {
      const res = await getAllUsers();
      const payload = res?.data;
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (Array.isArray(payload?.data)) list = payload.data;
      else if (Array.isArray(payload?.users)) list = payload.users;
      else if (Array.isArray(payload?.data?.users)) list = payload.data.users;
      else list = [];
      setUsers(list);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserStatus = (user) => {
    const isActive = user.is_active;
    
    if (!isActive) {
      return { text: "Inactive", className: "bg-red-100 text-red-700" };
    }
    return { text: "Active", className: "bg-green-100 text-green-700" };
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  // User Card Component for Mobile
  const UserCard = ({ user }) => {
    const userKey = user._id || user.user_id || user.id;
    const status = getUserStatus(user);
    const userName = user.name || user.user_name;
    const userEmail = user.email || user.user_email;
    const userMobile = user.mobile || user.user_mobile;
    const userRole = user.role || user.user_role;

    return (
      <div 
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleViewUser(user)}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-600 font-bold text-lg">
              {userName?.charAt(0) || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{userName}</h3>
            <p className="text-sm text-gray-500 truncate">{userEmail}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                {status.text}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {userRole || "user"}
              </span>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="max-w-7xl mx-auto">
         <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-500">Show The property Page Users</p>
        </div>
        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-gray-500">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <tr key={u._id || u.user_id || u.id || `u-${i}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {u.name?.charAt(0) || u.user_name?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{u.name || u.user_name}</p>
                          <p className="text-sm text-gray-500">{u.mobile || u.user_mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.email || u.user_email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUserStatus(u).className}`}>
                        {getUserStatus(u).text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewUser(u)}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors font-medium"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            users.map((u, i) => (
              <UserCard key={u._id || u.user_id || u.id || `u-${i}`} user={u} />
            ))
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden border border-gray-200 relative z-10">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-base font-semibold text-gray-900">User Details</h3>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-5">
              {/* User Info Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-bold text-lg">
                    {(selectedUser.user_name || selectedUser.name)?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {selectedUser.user_name || selectedUser.name || "N/A"}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">{selectedUser.user_email || selectedUser.email}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getUserStatus(selectedUser).className}`}>
                  {getUserStatus(selectedUser).text}
                </span>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={selectedUser.user_name || selectedUser.name || ""} 
                      readOnly 
                      className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-sm text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                    <input 
                      type="text" 
                      value={selectedUser.user_email || selectedUser.email || ""} 
                      readOnly 
                      className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-sm text-gray-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                    <input 
                      type="text" 
                      value={selectedUser.user_phone || selectedUser.phone || "N/A"} 
                      readOnly 
                      className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-sm text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                    <input 
                      type="text" 
                      value={(selectedUser.user_role || selectedUser.role) || "user"} 
                      readOnly 
                      className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-sm text-gray-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                    <input 
                      type="text" 
                      value={getUserStatus(selectedUser).text} 
                      readOnly 
                      className={`w-full border border-gray-200 rounded-md px-3 py-2 text-sm cursor-not-allowed ${
                        getUserStatus(selectedUser).text === "Active" 
                          ? "bg-green-50 text-green-700" 
                          : "bg-red-50 text-red-700"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Verified</label>
                    <input 
                      type="text" 
                      value={selectedUser.is_verified ? "Yes" : "No"} 
                      readOnly 
                      className={`w-full border border-gray-200 rounded-md px-3 py-2 text-sm cursor-not-allowed ${
                        selectedUser.is_verified 
                          ? "bg-green-50 text-green-700" 
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Active</label>
                    <input 
                      type="text" 
                      value={selectedUser.is_active ? "Yes" : "No"} 
                      readOnly 
                      className={`w-full border border-gray-200 rounded-md px-3 py-2 text-sm cursor-not-allowed ${
                        selectedUser.is_active 
                          ? "bg-green-50 text-green-700" 
                          : "bg-red-50 text-red-700"
                      }`}
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                  <textarea 
                    value={selectedUser.user_address || selectedUser.address || "N/A"} 
                    readOnly 
                    rows={2}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-sm text-gray-700 cursor-not-allowed resize-none"
                  />
                </div>

                {/* Joined Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Joined Date</label>
                  <input 
                    type="text" 
                    value={selectedUser.created_date ? new Date(selectedUser.created_date).toLocaleDateString() : "N/A"} 
                    readOnly 
                    className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-sm text-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
            
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

