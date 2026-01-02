import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
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
      // Try multiple common shapes for user lists
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
    // Backend returns is_verified and is_active fields
    // Only check is_active for status since is_verified is internal
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

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500">Manage all registered users</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u, i) => (
                <tr key={u._id || u.user_id || u.id || `u-${i}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {u.name?.charAt(0) || u.user_name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{u.name || u.user_name}</p>
                        <p className="text-sm text-gray-500">{u.mobile || u.user_mobile}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{u.email || u.user_email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {u.role || "user"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserStatus(u).className}`}>
                      {getUserStatus(u).text}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewUser(u)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-bold text-xl">
                    {selectedUser.user_name?.charAt(0) || selectedUser.name?.charAt(0) || "U"}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {selectedUser.user_name || selectedUser.name}
                  </h4>
                  <p className="text-gray-500">{selectedUser.user_email || selectedUser.email}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Role</span>
                  <span className="font-medium text-gray-900">
                    {(selectedUser.user_role || selectedUser.role) || "user"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserStatus(selectedUser).className}`}>
                    {getUserStatus(selectedUser).text}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium text-gray-900">
                    {selectedUser.user_phone || selectedUser.phone || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Address</span>
                  <span className="font-medium text-gray-900 text-right max-w-xs">
                    {selectedUser.user_address || selectedUser.address || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Verified</span>
                  <span className={`font-medium ${selectedUser.is_verified ? "text-green-600" : "text-yellow-600"}`}>
                    {selectedUser.is_verified ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Active</span>
                  <span className={`font-medium ${selectedUser.is_active ? "text-green-600" : "text-red-600"}`}>
                    {selectedUser.is_active ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Joined</span>
                  <span className="font-medium text-gray-900">
                    {selectedUser.created_date ? new Date(selectedUser.created_date).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

