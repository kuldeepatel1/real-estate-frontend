import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProperties, fetchSoldProperties, fetchPendingProperties } from "../redux/slices/propertySlice";
import { fetchAppointments } from "../redux/slices/appointmentSlice";
import { fetchCategories } from "../redux/slices/categorySlice";
import { fetchLocations } from "../redux/slices/locationSlice";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      color: "bg-blue-500",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    },
    { 
      label: "Available", 
      value: propertiesList.filter((p) => p.status === "available").length, 
      color: "bg-green-500",
      icon: "M5 13l4 4L19 7"
    },
    { 
      label: "Sold", 
      value: Array.isArray(soldProperties) ? soldProperties.length : 0, 
      color: "bg-red-500",
      icon: "M6 18L18 6M6 6l12 12"
    },
    { 
      label: "Appointments", 
      value: appointmentsList.length, 
      color: "bg-purple-500",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    },
    { 
      label: "Pending", 
      value: Array.isArray(pendingProperties) ? pendingProperties.length : 0, 
      color: "bg-yellow-500",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    { 
      label: "Categories", 
      value: categoriesList.length, 
      color: "bg-indigo-500",
      icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
    },
    { 
      label: "Locations", 
      value: locationsList.length, 
      color: "bg-teal-500",
      icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    },
  ];

  const quickActions = [
    {
      title: "Manage Properties",
      description: "View and edit all properties",
      to: "/admin/properties",
      color: "blue",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    },
    {
      title: "Manage Users",
      description: "Approve and manage users",
      to: "/admin/users",
      color: "green",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    },
    {
      title: "Appointments",
      description: "View and update appointments",
      to: "/admin/appointments",
      color: "purple",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name || user?.user_name}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-500 truncate">{stat.label}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0 ml-2`}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions - Responsive: 1 col mobile, 2 md, 3 lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link 
            key={action.title} 
            to={action.to}
            className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-${action.color}-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <svg className={`w-6 h-6 text-${action.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500 truncate">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Appointments - Responsive Table/Card */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
        </div>
        <div className="p-4 sm:p-6">
          {appointmentsList.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No appointments yet</p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                      <th className="pb-3 pr-4">Property</th>
                      <th className="pb-3 pr-4">Date & Time</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {appointmentsList.slice(0, 5).map((apt) => (
                      <tr key={apt._id} className="text-sm">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-900">{apt.property_id?.title || "Property Visit"}</p>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          {new Date(apt.appointment_date || apt.date).toLocaleDateString()} at {apt.appointment_time || apt.time}
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            apt.status === "confirmed" ? "bg-green-100 text-green-700" :
                            apt.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
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
                  <div key={apt._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{apt.property_id?.title || "Property Visit"}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(apt.appointment_date || apt.date).toLocaleDateString()} at {apt.appointment_time || apt.time}
                      </p>
                    </div>
                    <span className={`self-start sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      apt.status === "confirmed" ? "bg-green-100 text-green-700" :
                      apt.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {apt.status || "pending"}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

