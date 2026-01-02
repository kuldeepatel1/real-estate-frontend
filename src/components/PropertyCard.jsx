import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { addToFavorites, removeFromFavorites } from "../redux/slices/favoriteSlice";
import { getFirstImageUrl, hasImages } from "../utils/imageHelper";

export default function PropertyCard({ property }) {
  const dispatch = useDispatch();
  const { list: favorites } = useSelector((state) => state.favorites);
  const { token } = useSelector((state) => state.auth);
  
  const [imageError, setImageError] = useState(false);

  const isFavorite = favorites.some((f) => f.property_id === property._id || f.propertyId === property._id);

  const handleFavorite = () => {
    if (!token) {
      alert("Please login to add favorites");
      return;
    }
    if (isFavorite) {
      const fav = favorites.find((f) => f.property_id === property._id || f.propertyId === property._id);
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

  // Use imageHelper utilities to get image URL
  const firstImage = getFirstImageUrl(property);
  const propertyHasImages = hasImages(property);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {propertyHasImages && firstImage && !imageError ? (
          <img
            src={firstImage}
            alt={property.title || property.property_title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        {property.status && (
          <span className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium ${
            property.status === "available" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-full transition ${
            isFavorite ? "bg-red-500 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {property.title || property.property_title}
          </h3>
          <span className="text-lg font-bold text-indigo-600">
            {formatPrice(property.price || property.property_price)}
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {property.description || property.property_description}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          {property.property_type && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {property.property_type}
            </span>
          )}
          {property.location_id && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {property.location_id.city || "View Map"}
            </span>
          )}
        </div>

        <Link
          to={`/property/${property._id}`}
          className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

