import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavorites } from "../redux/slices/favoriteSlice";
import { fetchAppointments } from "../redux/slices/appointmentSlice";
import { logout } from "../redux/slices/authSlice";
import PropertyCard from "../components/PropertyCard";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

    const { user, loading, token } = useSelector((state) => state.auth);
  const { list: favorites } = useSelector((state) => state.favorites);
  const { list: appointments } = useSelector((state) => state.appointments);

  // Safe array variables
  const favoritesList = Array.isArray(favorites) ? favorites : [];
  const appointmentsList = Array.isArray(appointments) ? appointments : [];

  const [activeTab, setActiveTab] = useState("overview");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  /* ---------------- PREFILL PROFILE FORM ---------------- */
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || user.user_name || "",
        email: user.email || user.user_email || "",
        phone: user.phone || user.user_mobile || "",
        address: user.address || user.user_address || "",
      });
    }
  }, [user]);

  /* ---------------- FETCH DATA ---------------- */
    useEffect(() => {
      if (token) {
        dispatch(fetchFavorites());
        dispatch(fetchAppointments());
      }
    }, [dispatch, token]);

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  /* ---------------- UPDATE PROFILE ---------------- */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const payload = {
      user_name: editForm.name,
      user_email: editForm.email,
      user_mobile: editForm.phone,
      user_address: editForm.address,
    };

    const res = await dispatch(updateUserProfile(payload));
    if (res.meta.requestStatus === "fulfilled") {
      setShowEditProfile(false);
    }
  };

    const userAppointments = appointmentsList.filter(
      (a) => a.user_id === user?._id || a.user_id?._id === user?._id
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">
                  {user?.name?.charAt(0) || user?.user_name?.charAt(0) || "U"}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.name || user?.user_name}
                </h1>
                <p className="text-gray-500">
                  {user?.email || user?.user_email}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditProfile(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b">
            <nav className="flex gap-4 px-6">
              {["overview", "favorites", "appointments", "profile"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-medium capitalize ${
                    activeTab === tab
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-50 rounded-xl p-6">
                  <p className="text-2xl font-bold text-indigo-600">
                      {favoritesList.length}
                  </p>
                  <p className="text-indigo-800">Saved Properties</p>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <p className="text-2xl font-bold text-green-600">
                    {userAppointments.length}
                  </p>
                  <p className="text-green-800">Appointments</p>
                </div>

                <div className="bg-purple-50 rounded-xl p-6">
                  <p className="text-2xl font-bold text-purple-600">
                    {
                      userAppointments.filter(
                        (a) => a.status === "confirmed"
                      ).length
                    }
                  </p>
                  <p className="text-purple-800">Approved Visits</p>
                </div>
              </div>
            )}

            {/* FAVORITES */}
            {activeTab === "favorites" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {favoritesList.length === 0 ? (
                  <p className="text-gray-500 col-span-3 text-center py-8">No favorites yet</p>
                ) : (
                  favoritesList.map((fav) => {
                    // Backend returns favorite object with `property` nested
                    const raw = fav.property || fav.property_id || null;
                    if (!raw) return null;
                    // Normalize so components expect `_id` and `property_id`
                    const propertyObj = {
                      ...raw,
                      _id: raw.property_id ?? raw._id ?? raw.id,
                      property_id: raw.property_id ?? raw._id ?? raw.id,
                    };
                    return (
                      <PropertyCard
                        key={fav.favorite_id || fav._id || propertyObj._id || Math.random()}
                        property={propertyObj}
                      />
                    );
                  })
                )}
              </div>
            )}

            {/* APPOINTMENTS */}
            {activeTab === "appointments" && (
              <div className="space-y-4">
                {userAppointments.map((apt) => (
                  <div
                    key={apt._id}
                    className="bg-gray-50 rounded-lg p-4 flex justify-between"
                  >
                    <div>
                      <h4 className="font-medium">
                        {apt.property_id?.title || "Property Visit"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {new Date(
                          apt.appointment_date || apt.date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="capitalize">{apt.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* PROFILE */}
            {activeTab === "profile" && (
              <div className="space-y-3 max-w-xl">
                <p><b>Name:</b> {user?.name || user?.user_name}</p>
                <p><b>Email:</b> {user?.email || user?.user_email}</p>
                <p><b>Phone:</b> {user?.phone || user?.user_mobile}</p>
                <p><b>Address:</b> {user?.address || user?.user_address}</p>
                <p><b>Role:</b> {user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <input
                className="w-full border p-2 rounded"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="Name"
              />
              <input
                className="w-full border p-2 rounded"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                placeholder="Email"
              />
              <input
                className="w-full border p-2 rounded"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                placeholder="Phone"
              />
              <textarea
                className="w-full border p-2 rounded"
                value={editForm.address}
                onChange={(e) =>
                  setEditForm({ ...editForm, address: e.target.value })
                }
                placeholder="Address"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="w-1/2 border rounded p-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-indigo-600 text-white rounded p-2"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

