import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProperties, fetchSoldProperties, fetchPendingProperties } from "../redux/slices/propertySlice";
import { fetchAppointments } from "../redux/slices/appointmentSlice";
import { fetchCategories } from "../redux/slices/categorySlice";
import { fetchLocations } from "../redux/slices/locationSlice";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { list: properties, soldProperties, pendingProperties } = useSelector((state) => state.properties);
  const { list: appointments } = useSelector((state) => state.appointments);
  const { list: categories } = useSelector((state) => state.categories);
  const { list: locations } = useSelector((state) => state.locations);
  const { user } = useSelector((state) => state.auth);

  // Safe array variables
  const propertiesList = Array.isArray(properties) ? properties : [];
  const appointmentsList = Array.isArray(appointments) ? appointments : [];
  const categoriesList = Array.isArray(categories) ? categories : [];
  const locationsList = Array.isArray(locations) ? locations : [];

  useEffect(() => {
    dispatch(fetchProperties({}));
    dispatch(fetchSoldProperties());
    dispatch(fetchPendingProperties());
    dispatch(fetchAppointments());
    dispatch(fetchCategories());
    dispatch(fetchLocations());
  }, [dispatch]);

  const stats = [
    { 
      label: "Total Properties", 
      value: propertiesList.length, 
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      shadow: "shadow-blue-200"
    },
    { 
      label: "Available", 
      value: propertiesList.filter((p) => p.status === "available").length, 
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      icon: "M5 13l4 4L19 7",
      shadow: "shadow-emerald-200"
    },
    { 
      label: "Sold", 
      value: Array.isArray(soldProperties) ? soldProperties.length : 0, 
      color: "bg-gradient-to-br from-rose-500 to-red-600",
      icon: "M6 18L18 6M6 6l12 12",
      shadow: "shadow-rose-200"
    },
    { 
      label: "Appointments", 
      value: appointmentsList.length, 
      color: "bg-gradient-to-br from-violet-500 to-purple-600",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      shadow: "shadow-violet-200"
    },
    { 
      label: "Pending", 
      value: Array.isArray(pendingProperties) ? pendingProperties.length : 0, 
      color: "bg-gradient-to-br from-amber-500 to-orange-500",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      shadow: "shadow-amber-200"
    },
    { 
      label: "Categories", 
      value: categoriesList.length, 
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
      shadow: "shadow-indigo-200"
    },
    { 
      label: "Locations", 
      value: locationsList.length, 
      color: "bg-gradient-to-br from-teal-500 to-cyan-600",
      icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
      shadow: "shadow-teal-200"
    },
  ];

  const quickActions = [
    {
      title: "Manage Properties",
      description: "View and edit all properties",
      to: "/admin/properties",
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    },
    {
      title: "Manage Users",
      description: "Approve and manage users",
      to: "/admin/users",
      color: "emerald",
      gradient: "from-emerald-500 to-emerald-600",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    },
    {
      title: "Appointments",
      description: "View and update appointments",
      to: "/admin/appointments",
      color: "violet",
      gradient: "from-violet-500 to-purple-600",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    },
  ];

  return (
    <>
      {/* Header Section */}
      <div className="mb-8 animate-slide-down">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, <span className="font-semibold text-indigo-600">{user?.name || user?.user_name}</span>!</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/properties" className="btn-secondary inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Property
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={stat.label} 
            className="stat-card stat-card-hover group animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-slate-500 truncate font-medium">{stat.label}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0 ml-2 shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-300`}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
            </div>
            {/* Mini sparkline decoration */}
            <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${stat.color.replace('bg-gradient-to-br', 'bg-gradient-to-r')} rounded-full w-2/3 animate-shimmer`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link 
              key={action.title} 
              to={action.to}
              className="admin-card admin-card-hover p-5 group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-500 truncate">{action.description}</p>
                </div>
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="admin-section animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent Appointments</h2>
              <p className="text-sm text-slate-500">Latest property viewings</p>
            </div>
          </div>
          <Link to="/admin/appointments" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {appointmentsList.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="empty-state-title">No appointments yet</p>
            <p className="empty-state-text">Property viewings will appear here once scheduled</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="pb-4 pr-4">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Property
                      </span>
                    </th>
                    <th className="px-4 py-4">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Date & Time
                      </span>
                    </th>
                    <th className="px-4 py-4">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Status
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointmentsList.slice(0, 5).map((apt) => (
                    <tr key={apt._id} className="group">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{apt.property_id?.title || "Property Visit"}</p>
                            <p className="text-sm text-slate-500">{apt.user_id?.name || "User"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-slate-700">{new Date(apt.appointment_date || apt.date).toLocaleDateString()}</span>
                          <span className="text-slate-400">at</span>
                          <span className="font-medium text-slate-700">{apt.appointment_time || apt.time}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          apt.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                          apt.status === "pending" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            apt.status === "confirmed" ? "bg-emerald-500" :
                            apt.status === "pending" ? "bg-amber-500" :
                            "bg-red-500"
                          }`}></span>
                          {apt.status || "pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {appointmentsList.slice(0, 5).map((apt) => (
                <div key={apt._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{apt.property_id?.title || "Property Visit"}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(apt.appointment_date || apt.date).toLocaleDateString()} at {apt.appointment_time || apt.time}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold self-start sm:self-auto ${
                    apt.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                    apt.status === "pending" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      apt.status === "confirmed" ? "bg-emerald-500" :
                      apt.status === "pending" ? "bg-amber-500" :
                      "bg-red-500"
                    }`}></span>
                    {apt.status || "pending"}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

