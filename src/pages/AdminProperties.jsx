import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { useDispatch, useSelector } from "react-redux";
import { fetchProperties, deleteProperty, updateProperty, updatePropertyStatusOptimistic } from "../redux/slices/propertySlice";
import { fetchCategories } from "../redux/slices/categorySlice";
import { fetchLocations } from "../redux/slices/locationSlice";
import { getFirstImageUrl, hasImages } from "../utils/imageHelper";
import { getPropertyReviewStats } from "../services/reviewService";

export default function AdminProperties() {
  const dispatch = useDispatch();
  const { list: properties, loading } = useSelector((state) => state.properties);
  const { list: categories } = useSelector((state) => state.categories);
  const { list: locations } = useSelector((state) => state.locations);
  const [reviewStats, setReviewStats] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [toast, setToast] = useState(null);

  // Safe array variables
  const propertiesList = Array.isArray(properties) ? properties : [];
  const categoriesList = Array.isArray(categories) ? categories : [];

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

  // Fetch review stats for all properties
  useEffect(() => {
    const fetchAllReviewStats = async () => {
      const stats = {};
      for (const property of propertiesList) {
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

    if (propertiesList.length > 0) {
      fetchAllReviewStats();
    }
  }, [propertiesList]);

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

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    dispatch(deleteProperty(id));
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
    
    // Try to sync with backend (will fail if no API endpoint exists)
    dispatch(updateProperty({ id: propertyId, data: { status: newStatus } }))
      .unwrap()
      .then(() => {
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

  const getCategoryName = (catId) => {
    const cat = categoriesList.find((c) => {
      // support backend shapes: { category_id } or frontend normalized { _id }
      return (c._id && String(c._id) === String(catId)) || (c.category_id && String(c.category_id) === String(catId)) || (c.id && String(c.id) === String(catId));
    });
    return cat?.category_name || cat?.categoryName || "N/A";
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500">Manage all properties</p>
        </div>
        <Link
          to="/admin/properties/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Add Property
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviews</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </td>
              </tr>
            ) : propertiesList.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No properties found
                </td>
              </tr>
            ) : (
              propertiesList.map((property) => (
                <tr key={property._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                        {hasImages(property) && !imageErrors[property._id] ? (
                          <img
                            src={getFirstImageUrl(property)}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(property._id)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{property.title || property.property_title}</p>
                        <p className="text-sm text-gray-500">
                          {property.location_id?.city || "Location not specified"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    ${new Intl.NumberFormat("en-US").format(property.price || property.property_price)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{property.property_type || "N/A"}</td>
                  <td className="px-6 py-4 text-gray-600">{getCategoryName(property.category_id)}</td>
                  <td className="px-6 py-4">
                    {(() => {
                      const propId = property._id || property.property_id;
                      const stats = reviewStats[propId] || {};
                      return (
                        <div>
                          {renderStars(stats.average_rating)}
                          <span className="text-xs text-gray-500 ml-1">
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
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${
                          getEffectiveStatus(property) === "available" ? "bg-green-100 text-green-700" :
                          getEffectiveStatus(property) === "sold" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        } ${updatingStatus[property._id || property.property_id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        <option value="rented">Rented</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/property/${property._id}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(property._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
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
    </AdminLayout>
  );
}

