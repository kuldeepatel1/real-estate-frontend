import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { bookAppointment } from "../redux/slices/appointmentSlice";
import { Avatar } from "antd";

export default function BookAppointment() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.appointments);

  // Get property from location state or use default
  const property = location.state?.property || {
    title: "Sample Property",
    address: "123 Main Street, City",
    price: 500000,
    property_type: "sale"
  };

  const [form, setForm] = useState({
    date: "",
    time: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      user_id: user?._id || user?.user_id,
      seller_id: property.user_id,
      property_id: property._id || property.property_id,
      appointment_date: form.date,
      appointment_time: form.time,
      message: form.message,
    };

    const res = await dispatch(bookAppointment(payload));
    if (res.meta.requestStatus === "fulfilled") {
      setSubmitted(true);
      setTimeout(() => {
        navigate("/properties");
      }, 2000);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h3>
          <p className="text-gray-600 mb-4">The property owner will contact you soon.</p>
          <p className="text-sm text-gray-500">Redirecting to properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Book Appointment</h1>
          <p className="text-gray-600 mt-2">Fill in the details below to schedule a viewing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Property Information
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-24 h-24 bg-indigo-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {property?.property_images && property.property_images[0] ? (
                    <img 
                      src={`${import.meta.env.VITE_API_URL}${property.property_images[0]}`}
                      alt={property.title || property.property_title}
                      className="w-full h-full object-cover"
                    />
                  ) : property?.image ? (
                    <img 
                      src={`${import.meta.env.VITE_API_URL}${property.image}`}
                      alt={property.title || property.property_title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-indigo-600 m-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <p className="font-semibold text-gray-900 text-lg">{property?.title || property?.property_title}</p>
                  <p className="text-gray-500 mt-1">{property?.address || property?.location || "Full address of the property"}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    {property?.price && (
                      <p className="text-indigo-600 font-bold text-xl">${Number(property.price).toLocaleString()}</p>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      property?.property_type === 'rent' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {property?.property_type === 'rent' ? 'For Rent' : 'For Sale'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Appointment Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                >
                  <option value="">Select a time slot</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Additional Information
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                rows={4}
                placeholder="Any specific requirements or questions you'd like to share with the property owner..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <p className="text-sm text-gray-500 mt-2">
                Optional: Share any special requirements, questions, or preferred contact times.
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Your Contact Information
            </h2>
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center gap-3">
                <Avatar
                  size={40}
                  src={user?.user_profile_picture ? `${import.meta.env.VITE_API_URL}${user.user_profile_picture}` : null}
                  alt={user?.name || user?.user_name || "User"}
                >
                  {user?.name?.charAt(0) || user?.user_name?.charAt(0) || "U"}
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{user?.name || user?.user_name || "Guest User"}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                This information will be shared with the property owner to arrange your appointment.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Booking...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Book Appointment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

