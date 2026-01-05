import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { useDispatch, useSelector } from "react-redux";
import { fetchLocations, createLocation, updateLocation, deleteLocation } from "../redux/slices/locationSlice";

export default function AdminLocations() {
  const dispatch = useDispatch();
  const { list: locations, loading } = useSelector((state) => state.locations);

  // Safe array variables
  const locationsList = Array.isArray(locations) ? locations : [];

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ city: "", state: "", pincode: "", status: "active" });

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      // backend expects these exact keys
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
      // Debug: show payload
      // eslint-disable-next-line no-console
      console.debug("createLocation payload:", payload, "editingId:", editingId);

      if (editingId) {
        await dispatch(updateLocation({ id: editingId, data: payload })).unwrap();
      } else {
        await dispatch(createLocation(payload)).unwrap();
      }

      dispatch(fetchLocations());
      setShowForm(false);
      setEditingId(null);
      setForm({ city: "", state: "", pincode: "", status: "active" });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to save location:", err);
      const msg = typeof err === "string" ? err : (err?.message || "Failed to save location");
      alert(msg);
    }
  };

  const handleEdit = (location) => {
    setEditingId(location.location_id || location._id || location.id);
    setForm({
      city: location.city || location.location_city,
      state: location.state || location.location_state,
      pincode: location.zip_code || location.location_pincode || "",
      status: (location.is_active === false) ? "inactive" : "active",
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    dispatch(deleteLocation(id));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Locations</h1>
            <p className="text-gray-500">Manage property locations</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ city: "", state: "", pincode: "", status: "active" }); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
          >
            Add Location
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">{editingId ? "Edit Location" : "Add Location"}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
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
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
                  >
                    {editingId ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : locations.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-500">No locations found</p>
              </div>
            </div>
          ) : (
            locationsList.map((location) => (
              <div key={location.location_id || location._id || location.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{location.city || location.location_city || location.location_name}</h3>
                    <p className="text-gray-500">{location.state || location.location_state}</p>
                    { (location.zip_code || location.location_pincode) && (
                      <p className="text-sm text-gray-400 mt-1">Pincode: {location.zip_code || location.location_pincode}</p>
                    )}
                    <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                      (location.is_active === false) ? "bg-gray-100 text-gray-700" : "bg-green-100 text-green-700"
                    }`}>
                      {(location.is_active === false) ? "inactive" : "active"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(location)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(location.location_id || location._id || location.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

