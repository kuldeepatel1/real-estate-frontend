import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchLocations, createLocation, updateLocation } from "../redux/slices/locationSlice";

export default function AdminAddLocation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { list: locations } = useSelector((state) => state.locations);
  const editing = !!id;

  const [form, setForm] = useState({ city: "", state: "", pincode: "", status: "active" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  useEffect(() => {
    if (editing && locations.length > 0) {
      const location = locations.find(l => l._id === id || l.id === id || l.location_id === id);
      if (location) {
        setForm({
          city: location.city || location.location_city,
          state: location.state || location.location_state,
          pincode: location.zip_code || location.location_pincode || "",
          status: (location.is_active === false) ? "inactive" : "active"
        });
      }
    }
  }, [editing, id, locations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      location_name: form.city,
      city: form.city,
      state: form.state,
      country: "India",
      zip_code: String(form.pincode || "").trim() || "",
      latitude: undefined,
      longitude: undefined,
      is_active: form.status === "active",
    };
    
    try {
      if (editing) {
        await dispatch(updateLocation({ id, data: payload })).unwrap();
      } else {
        await dispatch(createLocation(payload)).unwrap();
      }
      navigate("/admin/locations");
    } catch (err) {
      console.error("Failed to save location:", err);
      alert(typeof err === "string" ? err : "Failed to save location");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/locations");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {editing ? "Edit Location" : "Add New Location"}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Location Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Enter city name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="Enter state name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  placeholder="Enter pincode"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : (editing ? "Update Location" : "Create Location")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

