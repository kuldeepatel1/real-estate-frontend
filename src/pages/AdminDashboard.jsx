import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProperties } from "../redux/slices/propertySlice";
import { fetchAppointments } from "../redux/slices/appointmentSlice";
import { fetchCategories } from "../redux/slices/categorySlice";
import { fetchLocations } from "../redux/slices/locationSlice";
import AdminLayout from "../components/AdminLayout";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: properties } = useSelector((state) => state.properties);
  const { list: appointments } = useSelector((state) => state.appointments);
  const { list: categories } = useSelector((state) => state.categories);
  const { list: locations } = useSelector((state) => state.locations);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProperties({}));
    dispatch(fetchAppointments());
    dispatch(fetchCategories());
    dispatch(fetchLocations());
  }, [dispatch]);

  const stats = [
    { label: "Total Properties", value: properties.length, color: "bg-blue-500" },
    { label: "Available", value: properties.filter((p) => p.status === "available").length, color: "bg-green-500" },
    { label: "Sold", value: properties.filter((p) => p.status === "sold").length, color: "bg-red-500" },
    { label: "Total Appointments", value: appointments.length, color: "bg-purple-500" },
    { label: "Pending", value: appointments.filter((a) => a.status === "pending").length, color: "bg-yellow-500" },
    { label: "Categories", value: categories.length, color: "bg-indigo-500" },
    { label: "Locations", value: locations.length, color: "bg-teal-500" },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.name || user?.user_name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/properties" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Properties</h3>
              <p className="text-sm text-gray-500">View and edit all properties</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/users" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500">Approve and manage users</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/appointments" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Appointments</h3>
              <p className="text-sm text-gray-500">View and update appointments</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Appointments */}
      <div className="mt-8 bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
        </div>
        <div className="p-6">
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No appointments yet</p>
          ) : (
            <div className="space-y-4">
              {appointments.slice(0, 5).map((apt) => (
                <div key={apt._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium">{apt.property_id?.title || "Property Visit"}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(apt.appointment_date || apt.date).toLocaleDateString()} at {apt.appointment_time || apt.time}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    apt.status === "approved" ? "bg-green-100 text-green-700" :
                    apt.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {apt.status || "pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

