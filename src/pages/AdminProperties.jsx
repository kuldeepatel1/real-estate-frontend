import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../components/AdminLayout";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProperties,
  markPropertyAsSold,
  markPropertyAsPending,
  updateProperty,
  updatePropertyStatusOptimistic
} from "../redux/slices/propertySlice";
import { fetchCategories } from "../redux/slices/categorySlice";
import { fetchLocations } from "../redux/slices/locationSlice";
import { getFirstImageUrl, hasImages } from "../utils/imageHelper";
import { getPropertyReviewStats } from "../services/reviewService";
import { Link } from "react-router-dom";

export default function AdminProperties() {
  const dispatch = useDispatch();
  const { list: properties, loading } = useSelector((state) => state.properties);
  const { list: categories } = useSelector((state) => state.categories);
  const { list: locations } = useSelector((state) => state.locations);
  const [reviewStats, setReviewStats] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [toast, setToast] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // Safe array variables
  const propertiesList = Array.isArray(properties) ? properties : [];
  const categoriesList = Array.isArray(categories) ? categories : [];
  const locationsList = Array.isArray(locations) ? locations : [];

  // Calculate stats
  const stats = {
    total: propertiesList.length,
    available: propertiesList.filter((p) => p.status === "available").length,
    sold: propertiesList.filter((p) => p.status === "sold").length,
    pending: propertiesList.filter((p) => p.status === "pending" || !p.status).length,
  };

  // Helper function to get category name
  const getCategoryName = (catId) => {
    const cat = categoriesList.find((c) => {
      return (c._id && String(c._id) === String(catId)) || (c.category_id && String(c.category_id) === String(catId)) || (c.id && String(c.id) === String(catId));
    });
    return cat?.category_name || cat?.categoryName || "N/A";
  };

  // Helper function to get location name
  const getLocationName = (locId) => {
    if (locId && typeof locId === 'object') {
      return locId.location_name || locId.city || locId.location_city || "N/A";
    }
    if (locId) {
      const loc = locationsList.find((l) => {
        return (l._id && String(l._id) === String(locId)) || (l.location_id && String(l.location_id) === String(locId)) || (l.id && String(l.id) === String(locId));
      });
      return loc?.city || loc?.location_name || "N/A";
    }
    return "N/A";
  };

  // Helper to get location display from property object
  const getPropertyLocationDisplay = (property) => {
    if (property.location_name) {
      return property.location_name;
    }
    if (property.city) {
      return property.city;
    }
    if (property.location_id && typeof property.location_id === 'object') {
      return property.location_id.location_name || property.location_id.city || "N/A";
    }
    return getLocationName(property.location_id) || "N/A";
  };

  // Helper function to extract category ID from property (handles object or string ID)
  const getPropertyCategoryId = (property) => {
    if (!property.category_id) return null;
    if (typeof property.category_id === 'object') {
      return property.category_id._id || property.category_id.category_id || property.category_id.id || null;
    }
    return property.category_id;
  };

  // Helper function to extract location ID from property (handles object or string ID)
  const getPropertyLocationId = (property) => {
    if (!property.location_id) return null;
    if (typeof property.location_id === 'object') {
      return property.location_id._id || property.location_id.location_id || property.location_id.id || null;
    }
    return property.location_id;
  };

  // Get filtered properties based on search and filters
  const filteredProperties = propertiesList.filter((property) => {
    // Search filter - checks title, location, type, category, city
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const title = (property.title || property.property_title || "").toLowerCase();
      const city = (property.city || "").toLowerCase();
      const locationName = (property.location_name || "").toLowerCase();
      const type = (property.property_type || "").toLowerCase();
      const address = (property.address || "").toLowerCase();
      const categoryName = getCategoryName(property.category_id).toLowerCase();
      const locationDisplay = getPropertyLocationDisplay(property).toLowerCase();

      const matchesSearch =
        title.includes(query) ||
        city.includes(query) ||
        locationName.includes(query) ||
        type.includes(query) ||
        address.includes(query) ||
        categoryName.includes(query) ||
        locationDisplay.includes(query);

      if (!matchesSearch) return false;
    }

    // Status filter
    const propertyStatus = property.status || property.property_status || "pending";
    if (statusFilter !== "all" && propertyStatus !== statusFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== "all") {
      const matchingCategory = categoriesList.find(cat => {
        const catName = (cat.category_name || cat.categoryName || "").toLowerCase();
        const filterLower = categoryFilter.toLowerCase();
        return catName === filterLower || 
               String(cat._id) === String(categoryFilter) ||
               String(cat.category_id) === String(categoryFilter) ||
               String(cat.id) === String(categoryFilter);
      });

      if (matchingCategory) {
        // Filter matches a category - get the actual category ID to compare
        const filterCategoryId = matchingCategory._id || matchingCategory.category_id || matchingCategory.id;
        const propCategoryId = getPropertyCategoryId(property);
        
        if (propCategoryId) {
          // Compare IDs
          if (String(propCategoryId) !== String(filterCategoryId)) {
            return false;
          }
        } else {
          // Property has no category ID, check if category name matches
          const propCategoryName = getCategoryName(property.category_id).toLowerCase();
          const matchingCatName = (matchingCategory.category_name || matchingCategory.categoryName || "").toLowerCase();
          if (propCategoryName !== matchingCatName) {
            return false;
          }
        }
      } else {
        // Filter doesn't match any known category, exclude all
        return false;
      }
    }

    // Location filter - match by location name (case-insensitive)
    if (locationFilter !== "all") {
      // First check if filter is a location name (text) rather than an ID
      const matchingLocation = locationsList.find(loc => {
        const locName = (loc.city || loc.location_name || "").toLowerCase();
        const filterLower = locationFilter.toLowerCase();
        return locName === filterLower || 
               String(loc._id) === String(locationFilter) ||
               String(loc.location_id) === String(locationFilter) ||
               String(loc.id) === String(locationFilter);
      });

      if (matchingLocation) {
        // Filter matches a location - get the actual location ID to compare
        const filterLocationId = matchingLocation._id || matchingLocation.location_id || matchingLocation.id;
        const propLocationId = getPropertyLocationId(property);
        
        if (propLocationId) {
          // Compare IDs
          if (String(propLocationId) !== String(filterLocationId)) {
            return false;
          }
        } else {
          // Property has no location ID, check if location name matches
          const propLocationDisplay = getPropertyLocationDisplay(property).toLowerCase();
          const matchingLocName = (matchingLocation.city || matchingLocation.location_name || "").toLowerCase();
          if (propLocationDisplay !== matchingLocName) {
            return false;
          }
        }
      } else {
        // Filter doesn't match any known location, exclude all
        return false;
      }
    }

    return true;
  });

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Handle image error for a specific property
  const handleImageError = (propertyId) => {
    setImageErrors(prev => ({ ...prev, [propertyId]: true }));
  };

  // Load persisted status from localStorage
  const getPersistedStatus = useCallback((propertyId) => {
    try {
      const persisted = localStorage.getItem(`property_status_${propertyId}`);
      return persisted ? JSON.parse(persisted) : null;
    } catch (e) {
      return null;
    }
  }, []);

  // Persist status to localStorage
  const persistStatus = useCallback((propertyId, status) => {
    try {
      localStorage.setItem(`property_status_${propertyId}`, JSON.stringify(status));
    } catch (e) {
      console.warn('Failed to persist status:', e);
    }
  }, []);

  // Clear persisted status from localStorage
  const clearPersistedStatus = useCallback((propertyId) => {
    try {
      localStorage.removeItem(`property_status_${propertyId}`);
    } catch (e) {
      console.warn('Failed to clear persisted status:', e);
    }
  }, []);

  // Fetch review stats for all properties
  useEffect(() => {
    const fetchAllReviewStats = async () => {
      const stats = {};
      for (const property of filteredProperties) {
        const propId = property._id || property.property_id;
        if (propId) {
          try {
            const res = await getPropertyReviewStats(propId);
            const data = res.data?.data || {};
            stats[propId] = {
              average_rating: data.stats?.average_rating || 0,
              total_reviews: data.stats?.total_reviews || 0
            };
          } catch (err) {
            stats[propId] = { average_rating: 0, total_reviews: 0 };
          }
        }
      }
      setReviewStats(stats);
    };

    if (filteredProperties.length > 0) {
      fetchAllReviewStats();
    }
  }, [filteredProperties]);

  useEffect(() => {
    dispatch(fetchProperties({}));
    dispatch(fetchCategories());
    dispatch(fetchLocations());
  }, [dispatch]);

  // Render stars for rating
  const renderStars = (rating) => {
    const filled = Math.round(rating || 0);
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= filled ? "text-yellow-400" : "text-gray-200"}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating?.toFixed(1) || "0.0"}</span>
      </div>
    );
  };



  const handleStatusChange = (property, newStatus) => {
    const propertyId = property._id || property.property_id;
    const propertyTitle = property.title || property.property_title;

    // Confirmation for sold status
    if (newStatus === 'sold') {
      if (!confirm(`Are you sure you want to mark "${propertyTitle}" as SOLD? This will remove it from the available listings.`)) {
        return;
      }
    }

    // Set loading state for this property
    setUpdatingStatus(prev => ({ ...prev, [propertyId]: true }));

    // Persist status in localStorage for frontend persistence
    persistStatus(propertyId, newStatus);

    // Optimistic update - update local state immediately for better UX
    dispatch(updatePropertyStatusOptimistic({ id: propertyId, status: newStatus }));

    // Dispatch the appropriate action based on status type
    let asyncAction;
    if (newStatus === 'sold') {
      asyncAction = markPropertyAsSold(propertyId);
    } else if (newStatus === 'pending') {
      asyncAction = markPropertyAsPending(propertyId);
    } else {
      asyncAction = updateProperty({ id: propertyId, data: { status: newStatus } });
    }

    // Execute the async action
    dispatch(asyncAction)
      .unwrap()
      .then(() => {
        // Clear persisted status on successful backend update
        clearPersistedStatus(propertyId);
        showToast(`Status updated to "${newStatus}" successfully!`, 'success');
      })
      .catch((error) => {
        console.warn('Backend sync failed, but status is saved locally:', error);
        showToast(`Status saved locally (backend sync pending)`, 'warning');
      })
      .finally(() => {
        setUpdatingStatus(prev => ({ ...prev, [propertyId]: false }));
      });
  };

  // Get effective status (from localStorage if available, otherwise from property)
  const getEffectiveStatus = (property) => {
    const propertyId = property._id || property.property_id;
    const persisted = getPersistedStatus(propertyId);
    return persisted || property.status || property.property_status || 'pending';
  };

  const handleViewProperty = (property) => {
    setSelectedProperty(property);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProperty(null);
  };

  const getPropertyStatusClass = (status) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-700";
      case "sold": return "bg-red-100 text-red-700";
      case "rented": return "bg-blue-100 text-blue-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  const getPropertyStatusText = (status) => {
    switch (status) {
      case "available": return "Available";
      case "sold": return "Sold";
      case "rented": return "Rented";
      default: return "Pending";
    }
  };

  // Property Card Component for Mobile
  const PropertyCard = ({ property }) => {
    const propId = property._id || property.property_id;
    const stats = reviewStats[propId] || {};

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-start gap-4">
          <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {hasImages(property) && !imageErrors[propId] ? (
              <img
                src={getFirstImageUrl(property)}
                alt=""
                className="w-full h-full object-cover"
                onError={() => handleImageError(propId)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-800 truncate">
              {property.title || property.property_title}
            </h3>
            <p className="text-sm text-gray-500">
              {getPropertyLocationDisplay(property)}
            </p>
            <p className="text-lg font-bold text-indigo-600">
              ${new Intl.NumberFormat("en-US").format(property.price || property.property_price)}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>
            <span className="ml-1 text-gray-800">{property.property_type || "N/A"}</span>
          </div>
          <div>
            <span className="text-gray-500">Category:</span>
            <span className="ml-1 text-gray-800">{getCategoryName(property.category_id)}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Reviews:</span>
            {renderStars(stats.average_rating)}
            <span className="text-xs text-gray-500 ml-1">({stats.total_reviews || 0})</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="relative">
            {updatingStatus[propId] && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              </div>
            )}
            <select
              value={getEffectiveStatus(property)}
              onChange={(e) => handleStatusChange(property, e.target.value)}
              disabled={updatingStatus[propId]}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer ${getEffectiveStatus(property) === "available" ? "bg-green-100 text-green-700" :
                getEffectiveStatus(property) === "sold" ? "bg-red-100 text-red-700" :
                  getEffectiveStatus(property) === "rented" ? "bg-blue-100 text-blue-700" :
                    "bg-yellow-100 text-yellow-700"
                } ${updatingStatus[propId] ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="pending">Pending</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleViewProperty(property)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium"
            >
              View
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11 2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
            <p className="text-slate-500">Manage and review all property listings</p>
          </div>
        </div>
        <Link
          to="/admin/add-property"
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:from-indigo-600 hover:to-violet-700 transition-all duration-300 active:scale-95 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Property
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="admin-card admin-card-hover p-6 bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Properties</p>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-100 text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="admin-card admin-card-hover p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Available</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.available}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-100 text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="admin-card admin-card-hover p-6 bg-gradient-to-br from-red-50 to-rose-50 border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Sold</p>
              <p className="text-3xl font-bold text-red-600">{stats.sold}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-100 text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="admin-card admin-card-hover p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Pending</p>
              <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-100 text-amber-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="admin-card p-5 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search properties by title, location, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80 text-slate-700 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80 text-slate-700 text-sm"
          >
            <option value="all">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat._id || cat.category_id} value={cat._id || cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80 text-slate-700 text-sm"
          >
            <option value="all">All Locations</option>
            {locationsList.map((loc) => (
              <option key={loc._id || loc.location_id} value={loc._id || loc.location_id}>
                {loc.city || loc.location_name}
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {(searchQuery || statusFilter !== "all" || categoryFilter !== "all" || locationFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCategoryFilter("all");
                setLocationFilter("all");
              }}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-slate-500">
          Showing {filteredProperties.length} of {propertiesList.length} properties
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11 2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Property
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-gradient-to-b from-slate-50 to-slate-100 border-b border-slate-200">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-gradient-to-b from-slate-50 to-slate-100 border-b border-slate-200">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-gradient-to-b from-slate-50 to-slate-100 border-b border-slate-200">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-gradient-to-b from-slate-50 to-slate-100 border-b border-slate-200">
                Reviews
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-gradient-to-b from-slate-50 to-slate-100 border-b border-slate-200">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-gradient-to-b from-slate-50 to-slate-100 border-b border-slate-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-slate-500">Loading properties...</p>
                  </div>
                </td>
              </tr>
            ) : filteredProperties.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-16">
                  <div className="empty-state">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="empty-state-title">No Properties Found</h3>
                    <p className="empty-state-text">There are no properties to display with the current filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProperties.map((property) => (
                <tr key={property._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                        {hasImages(property) && !imageErrors[property._id] ? (
                          <img
                            src={getFirstImageUrl(property)}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(property._id)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11 2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{property.title || property.property_title}</p>
                        <p className="text-sm text-slate-500">
                          {getPropertyLocationDisplay(property)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    ${new Intl.NumberFormat("en-US").format(property.price || property.property_price)}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{property.property_type || "N/A"}</td>
                  <td className="px-6 py-4 text-slate-600">{getCategoryName(property.category_id)}</td>
                  <td className="px-6 py-4">
                    {(() => {
                      const propId = property._id || property.property_id;
                      const stats = reviewStats[propId] || {};
                      return (
                        <div>
                          {renderStars(stats.average_rating)}
                          <span className="text-xs text-slate-500 ml-1">
                            ({stats.total_reviews || 0} reviews)
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      {updatingStatus[property._id || property.property_id] && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                        </div>
                      )}
                      <select
                        value={getEffectiveStatus(property)}
                        onChange={(e) => handleStatusChange(property, e.target.value)}
                        disabled={updatingStatus[property._id || property.property_id]}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border-0 cursor-pointer ${
                          getEffectiveStatus(property) === "available"
                            ? "bg-emerald-100 text-emerald-700"
                            : getEffectiveStatus(property) === "sold"
                            ? "bg-red-100 text-red-700"
                            : getEffectiveStatus(property) === "rented"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        } ${
                          updatingStatus[property._id || property.property_id]
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        {/* <option value="rented">Rented</option> */}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewProperty(property)}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:from-indigo-600 hover:to-violet-700 transition-all duration-300 active:scale-95 flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="empty-state py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="empty-state-title">No Properties Found</h3>
            <p className="empty-state-text">Try changing your search or filter options.</p>
          </div>
        ) : (
          filteredProperties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))
        )}
      </div>

      {/* Property Detail Modal */}
      {showModal && selectedProperty && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden border border-slate-200 relative z-10 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white sticky top-0 z-10">
              <h3 className="text-lg font-semibold text-slate-900">Property Details</h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Property Image */}
              <div className="mb-5">
                <div className="w-full h-40 bg-slate-100 rounded-xl overflow-hidden">
                  {hasImages(selectedProperty) && !imageErrors[selectedProperty._id] ? (
                    <img
                      src={getFirstImageUrl(selectedProperty)}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(selectedProperty._id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Property Info Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">
                    {selectedProperty.title || selectedProperty.property_title || "N/A"}
                  </h4>
                  <p className="text-sm text-slate-500 truncate">
                    {getPropertyLocationDisplay(selectedProperty)}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPropertyStatusClass(getEffectiveStatus(selectedProperty))}`}>
                  {getPropertyStatusText(getEffectiveStatus(selectedProperty))}
                </span>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Price</label>
                    <input
                      type="text"
                      value={`$${new Intl.NumberFormat("en-US").format(selectedProperty.price || selectedProperty.property_price || 0)}`}
                      readOnly
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-sm text-slate-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Property Type</label>
                    <input
                      type="text"
                      value={selectedProperty.property_type || "N/A"}
                      readOnly
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-sm text-slate-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Category</label>
                    <input
                      type="text"
                      value={getCategoryName(selectedProperty.category_id)}
                      readOnly
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-sm text-slate-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Location</label>
                    <input
                      type="text"
                      value={getLocationName(selectedProperty.location_id)}
                      readOnly
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-sm text-slate-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Beds</label>
                    <input
                      type="text"
                      value={selectedProperty.bedrooms || "0"}
                      readOnly
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-sm text-slate-700 cursor-not-allowed text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Baths</label>
                    <input
                      type="text"
                      value={selectedProperty.bathrooms || "0"}
                      readOnly
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-sm text-slate-700 cursor-not-allowed text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Area (sqft)</label>
                    <input
                      type="text"
                      value={selectedProperty.area_sqft || "0"}
                      readOnly
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-sm text-slate-700 cursor-not-allowed text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Year Built</label>
                    <input
                      type="text"
                      value={selectedProperty.year_built || "N/A"}
                      readOnly
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-sm text-slate-700 cursor-not-allowed text-center"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Address</label>
                  <textarea
                    value={selectedProperty.address || "N/A"}
                    readOnly
                    rows={2}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-sm text-slate-700 cursor-not-allowed resize-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Description</label>
                  <textarea
                    value={selectedProperty.description || selectedProperty.property_description || "N/A"}
                    readOnly
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-sm text-slate-700 cursor-not-allowed resize-none"
                  />
                </div>

                {/* Amenities */}
                <div className="grid grid-cols-3 gap-2">
                  <div className={`px-3 py-2 rounded-md text-xs text-center ${selectedProperty.has_garden ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-100"}`}>
                    Garden
                  </div>
                  <div className={`px-3 py-2 rounded-md text-xs text-center ${selectedProperty.has_pool ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-100"}`}>
                    Pool
                  </div>
                  <div className={`px-3 py-2 rounded-md text-xs text-center ${selectedProperty.pet_friendly ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-100"}`}>
                    Pet Friendly
                  </div>
                  <div className={`px-3 py-2 rounded-md text-xs text-center ${selectedProperty.furnished ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-100"}`}>
                    Furnished
                  </div>
                  <div className={`px-3 py-2 rounded-md text-xs text-center ${selectedProperty.parking_spots > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-100"}`}>
                    Parking
                  </div>
                  <div className={`px-3 py-2 rounded-md text-xs text-center ${selectedProperty.is_featured ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-100"}`}>
                    Featured
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-slate-200 hover:shadow-xl hover:from-slate-600 hover:to-slate-700 transition-all duration-300 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
          }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

