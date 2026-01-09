import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchLocations, deleteLocation } from "../redux/slices/locationSlice";

export default function AdminLocations() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: locations, loading } = useSelector((state) => state.locations);

  // Safe array variables
  const locationsList = Array.isArray(locations) ? locations : [];

  // Calculate stats
  const totalLocations = locationsList.length;
  const activeLocations = locationsList.filter(l => l.is_active !== false).length;
  const inactiveLocations = locationsList.filter(l => l.is_active === false).length;

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    dispatch(deleteLocation(id));
  };

  // Get status badge styling with icons
  const getStatusBadge = (isActive) => {
    if (isActive !== false) {
      return { 
        text: "Active", 
        className: "bg-emerald-100 text-emerald-700 border-emerald-200", 
        icon: "M5 13l4 4L19 7" 
      };
    }
    return { 
      text: "Inactive", 
      className: "bg-slate-100 text-slate-600 border-slate-200", 
      icon: "M6 18L18 6M6 6l12 12" 
    };
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

  // Location Card Component
  const LocationCard = ({ location }) => {
    const statusInfo = getStatusBadge(location.is_active);
    const locationId = location.location_id || location._id || location.id;
    const cityName = location.city || location.location_city || location.location_name;
    const stateName = location.state || location.location_state;
    const pincode = location.zip_code || location.location_pincode;

    return (
      <div className="admin-card admin-card-hover p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{cityName}</h3>
              <p className="text-sm text-slate-500">{stateName}</p>
              {pincode && (
                <p className="text-xs text-slate-400 mt-1">Pincode: {pincode}</p>
              )}
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusInfo.className}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusInfo.icon} />
            </svg>
            {statusInfo.text}
          </span>
        </div>
        
        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <button
            onClick={() => navigate(`/admin/locations/edit/${locationId}`)}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
            disabled={!locationId}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => handleDelete(locationId)}
            className="flex-1 btn-danger flex items-center justify-center gap-2"
            disabled={!locationId}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Total Locations"
          value={totalLocations}
          icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          colorClass="bg-amber-100 text-amber-600"
          bgClass="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100"
        />
        <StatsCard
          title="Active Locations"
          value={activeLocations}
          icon="M5 13l4 4L19 7"
          colorClass="bg-emerald-100 text-emerald-600"
          bgClass="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100"
        />
        <StatsCard
          title="Inactive Locations"
          value={inactiveLocations}
          icon="M6 18L18 6M6 6l12 12"
          colorClass="bg-slate-100 text-slate-600"
          bgClass="bg-gradient-to-br from-slate-100 to-gray-50 border-slate-200"
        />
      </div>

      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Locations</h1>
          <p className="text-slate-500">Manage property locations</p>
        </div>
        <button
          onClick={() => navigate("/admin/locations/add")}
          className="ml-auto btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Location
        </button>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500">Loading locations...</p>
          </div>
        ) : locationsList.length === 0 ? (
          <div className="col-span-full">
            <div className="empty-state py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="empty-state-title">No Locations Found</h3>
              <p className="empty-state-text">Start by adding your first location.</p>
              <button
                onClick={() => navigate("/admin/locations/add")}
                className="mt-4 btn-primary"
              >
                Add First Location
              </button>
            </div>
          </div>
        ) : (
          locationsList.map((location) => (
            <LocationCard key={location.location_id || location._id || location.id} location={location} />
          ))
        )}
      </div>
    </div>
  );
}

