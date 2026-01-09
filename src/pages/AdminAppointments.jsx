import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { useDispatch, useSelector } from "react-redux";
import { fetchAppointments, updateAppointment } from "../redux/slices/appointmentSlice";
import { getAllUsers } from "../services/authService";

export default function AdminAppointments() {
  const dispatch = useDispatch();
  const { list: appointments, loading } = useSelector((state) => state.appointments);
  const [users, setUsers] = useState([]);

  // Safe array variables
  const appointmentsList = Array.isArray(appointments) ? appointments : [];
  const usersList = Array.isArray(users) ? users : [];
  
  // Calculate stats
  const totalAppointments = appointmentsList.length;
  const pendingAppointments = appointmentsList.filter(a => a.status === "pending").length;
  const confirmedAppointments = appointmentsList.filter(a => a.status === "confirmed").length;
  const cancelledAppointments = appointmentsList.filter(a => a.status === "cancelled").length;

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  // Load all users (same source as AdminUsers) so we can map user_id -> full user object
  useEffect(() => {
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
      } catch (err) {
        console.error("Error loading users for appointments:", err);
        setUsers([]);
      }
    };

    loadUsers();
  }, []);

  const handleStatusChange = (appointment, newStatus) => {
    dispatch(updateAppointment({ id: appointment._id, data: { status: newStatus } }));
  };

  // Get status badge styling with icons
  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return {
          class: "bg-emerald-100 text-emerald-700 border-emerald-200",
          icon: "M5 13l4 4L19 7",
          label: "Confirmed"
        };
      case "pending":
        return {
          class: "bg-amber-100 text-amber-700 border-amber-200 animate-pulse",
          icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
          label: "Pending"
        };
      case "cancelled":
        return {
          class: "bg-red-100 text-red-700 border-red-200",
          icon: "M6 18L18 6M6 6l12 12",
          label: "Cancelled"
        };
      default:
        return {
          class: "bg-slate-100 text-slate-600 border-slate-200",
          icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
          label: "Unknown"
        };
    }
  };

  // Stats Card Component
  const StatsCard = ({ title, value, icon, colorClass, bgClass }) => (
    <div className={`admin-card admin-card-hover p-6 ${bgClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass}`}>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
    </div>
  );

  // Find the full user object for a given appointment, based on user_id
  const getAppointmentUser = (apt) => {
    if (!apt) return null;

    // user id can be a string, number, or object
    const raw = apt.user_id || apt.user || apt.userId || apt.customer_id;
    let uid = null;
    if (raw && typeof raw === "object") {
      uid = raw._id || raw.user_id || raw.id;
    } else {
      uid = raw;
    }
    if (!uid) return null;

    return (
      usersList.find((u) => {
        const uId = u._id || u.user_id || u.id;
        return uId && String(uId) === String(uid);
      }) || null
    );
  };

  // Helper: get user display name, preferring the same fields used in AdminUsers
  const getUserDisplayName = (apt) => {
    if (!apt) return "";
    const user = getAppointmentUser(apt);
    if (user) {
      return user.other_party_name || user.user_name || user.name || "";
    }
    // fallback to any name fields directly on appointment payload
    return apt.other_party_name || apt.name || apt.full_name || "";
  };

  const getUserEmail = (apt) => {
    if (!apt) return "";
    const user = getAppointmentUser(apt);
    if (user) {
      return user.email || user.user_email || "";
    }
    return apt.user_email || apt.email || "";
  };

  // Appointment Card Component for Mobile
  const AppointmentCard = ({ apt }) => {
    const statusInfo = getStatusBadge(apt.status);
    const userName = getUserDisplayName(apt);

    // Handle property display - backend returns property_title as string, property_id as integer
    const propertyTitle = apt.property_title || apt.property_id?.title || "Property Visit";
    const propertyId = apt.property_id?._id || (typeof apt.property_id === 'string' ? apt.property_id : apt.property_id);

    return (
      <div className="admin-card admin-card-hover p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">
                {propertyTitle}
              </h4>
              <p className="text-sm text-slate-500">
                {userName || "User"}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusInfo.class}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusInfo.icon} />
            </svg>
            {statusInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm mb-4">
          <div className="flex items-center gap-2 text-slate-600">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-medium">{new Date(apt.appointment_date || apt.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium">{apt.appointment_time || apt.time}</span>
          </div>
        </div>

        {apt.status === "pending" && (
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={() => handleStatusChange(apt, "confirmed")}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approve
            </button>
            <button
              onClick={() => handleStatusChange(apt, "cancelled")}
              className="flex-1 btn-danger flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Appointments"
          value={totalAppointments}
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          colorClass="bg-indigo-100 text-indigo-600"
          bgClass="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100"
        />
        <StatsCard
          title="Pending"
          value={pendingAppointments}
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          colorClass="bg-amber-100 text-amber-600"
          bgClass="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100"
        />
        <StatsCard
          title="Confirmed"
          value={confirmedAppointments}
          icon="M5 13l4 4L19 7"
          colorClass="bg-emerald-100 text-emerald-600"
          bgClass="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100"
        />
        <StatsCard
          title="Cancelled"
          value={cancelledAppointments}
          icon="M6 18L18 6M6 6l12 12"
          colorClass="bg-red-100 text-red-600"
          bgClass="bg-gradient-to-br from-red-50 to-rose-50 border-red-100"
        />
      </div>

      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="text-slate-500">Manage and approve user property visit appointments</p>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block admin-card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-gradient-to-b from-slate-50 to-slate-100 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Property
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-gradient-to-b from-slate-50 to-slate-100 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  User
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-gradient-to-b from-slate-50 to-slate-100 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Date & Time
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-gradient-to-b from-slate-50 to-slate-100 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-gradient-to-b from-slate-50 to-slate-100 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Message
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-gradient-to-b from-slate-50 to-slate-100 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-slate-500">Loading appointments...</p>
                  </div>
                </td>
              </tr>
            ) : appointmentsList.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-16">
                  <div className="empty-state">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="empty-state-title">No Appointments Found</h3>
                    <p className="empty-state-text">There are no appointments to display at this time.</p>
                  </div>
                </td>
              </tr>
            ) : (
              appointmentsList.map((apt) => {
                const statusInfo = getStatusBadge(apt.status);
                // Handle property display - backend returns property_title as string, property_id as integer
                const propertyTitle = apt.property_title || apt.property_id?.title || "Property";
                const propertyIdValue = apt.property_id?._id || (typeof apt.property_id === 'string' ? apt.property_id : String(apt.property_id));
                
                return (
                  <tr key={apt._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {propertyTitle}
                          </p>
                          <p className="text-xs text-slate-500">
                            Property ID: {propertyIdValue ? propertyIdValue.slice(-6) : "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-emerald-600">
                            {(getUserDisplayName(apt) || "U").charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {getUserDisplayName(apt) || "User"}
                          </p>
                          <p className="text-sm text-slate-500">{getUserEmail(apt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {new Date(apt.appointment_date || apt.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-slate-500">{apt.appointment_time || apt.time}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusInfo.class}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusInfo.icon} />
                        </svg>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 font-medium">we are meet</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {apt.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(apt, "confirmed")}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-emerald-200 hover:shadow-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 active:scale-95 flex items-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(apt, "cancelled")}
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-red-200 hover:shadow-xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 active:scale-95 flex items-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500">Loading appointments...</p>
          </div>
        ) : appointmentsList.length === 0 ? (
          <div className="empty-state py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="empty-state-title">No Appointments Found</h3>
            <p className="empty-state-text">There are no appointments to display at this time.</p>
          </div>
        ) : (
          appointmentsList.map((apt) => (
            <AppointmentCard key={apt._id} apt={apt} />
          ))
        )}
      </div>
    </div>
  );
}

