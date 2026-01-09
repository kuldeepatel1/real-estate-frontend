import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPropertyById, clearCurrentProperty } from "../redux/slices/propertySlice";
import { fetchReviewsByProperty, clearReviews } from "../redux/slices/reviewSlice";
import { fetchFavorites } from "../redux/slices/favoriteSlice";
import { addToFavorites, removeFromFavorites } from "../redux/slices/favoriteSlice";
import { fetchCategories } from "../redux/slices/categorySlice";
import { fetchLocations } from "../redux/slices/locationSlice";
import PropertyCard from "../components/PropertyCard";
import ReviewForm from "../components/ReviewForm";
import { getAllImageUrls, hasImages } from "../utils/imageHelper";

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProperty: property, loading } = useSelector((state) => state.properties);
  const { list: reviews, loading: reviewsLoading } = useSelector((state) => state.reviews);
  const { list: favorites } = useSelector((state) => state.favorites);
  const { user, token } = useSelector((state) => state.auth);
  const { list: categories } = useSelector((state) => state.categories);
  const { list: locations } = useSelector((state) => state.locations);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    dispatch(fetchPropertyById(id));
    dispatch(fetchReviewsByProperty(id));
    dispatch(fetchCategories());
    dispatch(fetchLocations());
    if (token) dispatch(fetchFavorites());

    return () => {
      dispatch(clearCurrentProperty());
      dispatch(clearReviews());
    };
  }, [dispatch, id, token]);

  const isFavorite = favorites.some(
    (f) => f.property_id === property?._id || f.propertyId === property?._id
  );

  const handleFavorite = () => {
    if (!token) {
      alert("Please login to add favorites");
      return;
    }
    if (isFavorite) {
      const fav = favorites.find(
        (f) => f.property_id === property._id || f.propertyId === property._id
      );
      if (fav) dispatch(removeFromFavorites(fav._id));
    } else {
      dispatch(addToFavorites({ property_id: property._id }));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.review_rating || r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Helper function to get location display string
  // Prioritizes location_name from the property data
  const getLocationDisplay = () => {
    // Check top-level location_name first (most specific)
    if (property.location_name && property.location_name.trim()) {
      return property.location_name;
    }

    // Check top-level city as fallback
    if (property.city && property.city.trim()) {
      return property.city;
    }

    // Check location_id object (in case backend returned nested location)
    if (property.location_id) {
      // Handle case where location_id is an object with location_name
      if (typeof property.location_id === 'object' && property.location_id !== null) {
        if (property.location_id.location_name && property.location_id.location_name.trim()) {
          return property.location_id.location_name;
        }
        if (property.location_id.city && property.location_id.city.trim()) {
          return property.location_id.city;
        }
      }
      // Handle case where location_id is just a string/ID - look up in Redux store
      if (typeof property.location_id === 'string' && property.location_id.trim()) {
        const location = locations.find(
          (l) => l._id === property.location_id || l.id === property.location_id || l.location_id === property.location_id
        );
        if (location) {
          return location.location_name || location.city || location.name || property.location_id;
        }
        return property.location_id;
      }
    }

    // Fallback to address if available
    if (property.address && property.address.trim()) {
      return property.address;
    }

    return "Location not specified";
  };

  // Helper function to get category name from category_id
  const getCategoryName = (categoryId) => {
    if (!categoryId) return "N/A";
    const category = categories.find(
      (c) => c._id === categoryId || c.id === categoryId || c.category_id === categoryId
    );
    return category?.category_name || category?.name || "N/A";
  };

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <Link to="/properties" className="text-indigo-600 hover:text-indigo-700">
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  // Use imageHelper utility to get all image URLs
  const images = getAllImageUrls(property);
  

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-indigo-600">Properties</Link>
          <span>/</span>
          <span className="text-gray-900">{property.title || property.property_title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="relative h-96">
                {images.length > 0 && images[currentImageIndex] && !imageErrors[currentImageIndex] ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={property.title || property.property_title}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(currentImageIndex)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                )}

                {/* Favorite Button */}
                <button
                  onClick={handleFavorite}
                  className={`absolute top-4 right-4 p-3 rounded-full transition ${
                    isFavorite ? "bg-red-500 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <svg className="w-6 h-6" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        index === currentImageIndex ? "border-indigo-600" : "border-transparent"
                      }`}
                    >
                      {img && !imageErrors[index] ? (
                        <img 
                          src={img} 
                          alt="" 
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(index)}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {property.title || property.property_title}
                  </h1>
                  <p className="text-gray-500 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {getLocationDisplay()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-indigo-600">
                    {formatPrice(property.price || property.property_price)}
                  </p>
                  {property.status && (
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                      property.status === "available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-900">
                    {property.property_type || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">Type</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-900">
                    {getCategoryName(property.category_id)}
                  </p>
                  <p className="text-sm text-gray-500">Category</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-900">
                    {calculateAverageRating()}
                  </p>
                  <p className="text-sm text-gray-500">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-900">
                    {reviews.length}
                  </p>
                  <p className="text-sm text-gray-500">Reviews</p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {property.description || property.property_description || "N/A"}
                </p>
              </div>

              {/* Address & Additional Details */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Property Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Address</p>
                      <p className="text-gray-800 font-medium">
                        {property.address || 
                         property.location_id?.address || 
                         property.location_id?.full_address ||
                         property.location_id?.street_address ||
                         "Location not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Year Built</p>
                      <p className="text-gray-800 font-medium">{property.year_built || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Bedrooms</p>
                      <p className="text-gray-800 font-medium">{property.bedrooms || "0"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Bathrooms</p>
                      <p className="text-gray-800 font-medium">{property.bathrooms || "0"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Area (sqft)</p>
                      <p className="text-gray-800 font-medium">{property.area_sqft || "0"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Parking Spots</p>
                      <p className="text-gray-800 font-medium">{property.parking_spots || "0"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {property.has_garden && (
                    <div className="px-4 py-3 rounded-lg text-sm text-center font-medium bg-green-100 text-green-700">
                      Garden
                    </div>
                  )}
                  {property.has_pool && (
                    <div className="px-4 py-3 rounded-lg text-sm text-center font-medium bg-green-100 text-green-700">
                      Pool
                    </div>
                  )}
                  {property.pet_friendly && (
                    <div className="px-4 py-3 rounded-lg text-sm text-center font-medium bg-green-100 text-green-700">
                      Pet Friendly
                    </div>
                  )}
                  {property.furnished && (
                    <div className="px-4 py-3 rounded-lg text-sm text-center font-medium bg-green-100 text-green-700">
                      Furnished
                    </div>
                  )}
                  {property.parking_spots > 0 && (
                    <div className="px-4 py-3 rounded-lg text-sm text-center font-medium bg-green-100 text-green-700">
                      Parking
                    </div>
                  )}
                  {property.is_featured && (
                    <div className="px-4 py-3 rounded-lg text-sm text-center font-medium bg-green-100 text-green-700">
                      Featured
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Reviews ({reviews.length})</h3>

              {/* Review Form */}
              {token && <ReviewForm propertyId={id} />}

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this property!</p>
              ) : (
                <div className="space-y-4 mt-6">
                  {reviews.map((review) => (
                    <div key={review.review_id || review._id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {(review.user_name || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{review.user_name || "User"}</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${star <= (review.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        {review.created_date && (
                          <span className="text-xs text-gray-400 ml-auto">
                            {new Date(review.created_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{review.comment || review.review_comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Book Appointment */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Interested in this property?</h3>
              <button
                onClick={() => navigate("/book-appointment", { state: { property } })}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition mb-3 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book a Visit
              </button>

              {/* Property Agent Info */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Property Owner</p>
                    <p className="text-sm text-gray-500">
                      Listed on {(property.created_date) 
                        ? new Date(property.created_date).toLocaleDateString() 
                        : "Recently"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

