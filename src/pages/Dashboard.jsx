import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavorites } from "../redux/slices/favoriteSlice";
import { fetchAppointments } from "../redux/slices/appointmentSlice";
import { logout } from "../redux/slices/authSlice";
import PropertyCard from "../components/PropertyCard";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token } = useSelector((state) => state.auth);
  const { list: favorites } = useSelector((state) => state.favorites);
  const { list: appointments } = useSelector((state) => state.appointments);

  // Safe array variables
  const favoritesList = Array.isArray(favorites) ? favorites : [];
  const appointmentsList = Array.isArray(appointments) ? appointments : [];

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const userAppointments = appointmentsList.filter(
    (a) => a.user_id === user?._id || a.user_id?._id === user?._id
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate("/edit-profile")}
                className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-center"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tabs with Horizontal Scroll on Mobile */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b overflow-x-auto">
            <nav className="flex min-w-max px-4 gap-1 sm:gap-4">
              {["overview", "favorites", "appointments", "profile"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-3 sm:px-4 border-b-2 font-medium text-sm sm:text-base whitespace-nowrap capitalize ${
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

          <div className="p-4 sm:p-6">
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {favoritesList.length === 0 ? (
                  <p className="text-gray-500 col-span-3 text-center py-8">No favorites yet</p>
                ) : (
                  favoritesList.map((fav) => {
                    const raw = fav.property || fav.property_id || null;
                    if (!raw) return null;
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
                {userAppointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No appointments yet</p>
                ) : (
                  userAppointments.map((apt) => (
                    <div
                      key={apt._id}
                      className="bg-gray-50 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
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
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        apt.status === "confirmed" ? "bg-green-100 text-green-700" :
                        apt.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PROFILE */}
            {activeTab === "profile" && (
              <div className="space-y-3 max-w-xl">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user?.name || user?.user_name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email || user?.user_email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user?.phone || user?.user_mobile || "N/A"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{user?.address || user?.user_address || "N/A"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{user?.role || "user"}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

