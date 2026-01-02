import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { useDispatch, useSelector } from "react-redux";
import { fetchAppointments, updateAppointment } from "../redux/slices/appointmentSlice";

export default function AdminAppointments() {
  const dispatch = useDispatch();
  const { list: appointments, loading } = useSelector((state) => state.appointments);

  // Safe array variables
  const appointmentsList = Array.isArray(appointments) ? appointments : [];

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const handleStatusChange = (appointment, newStatus) => {
    dispatch(updateAppointment({ id: appointment._id, data: { status: newStatus } }));
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-500">Manage property viewing appointments</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
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
            ) : appointmentsList.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No appointments found
                </td>
              </tr>
            ) : (
              appointmentsList.map((apt) => (
                <tr key={apt._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium">{apt.property_id?.title || "Property"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{apt.user_id?.name || "User"}</p>
                    <p className="text-sm text-gray-500">{apt.user_id?.email || ""}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">
                      {new Date(apt.appointment_date || apt.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">{apt.appointment_time || apt.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      apt.status === "confirmed" ? "bg-green-100 text-green-700" :
                      apt.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {apt.status || "pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {apt.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(apt, "confirmed")}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(apt, "cancelled")}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

