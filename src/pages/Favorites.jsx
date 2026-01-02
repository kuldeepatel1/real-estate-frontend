import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavorites } from "../redux/slices/favoriteSlice";
import PropertyCard from "../components/PropertyCard";

export default function Favorites() {
  const dispatch = useDispatch();
  const { list: favorites, loading } = useSelector((state) => state.favorites);
  const { token } = useSelector((state) => state.auth);
  const favoritesList = Array.isArray(favorites) ? favorites : [];

  useEffect(() => {
    if (token) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, token]);

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Favorites</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : favoritesList.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
            <p className="text-gray-500 mb-6">Start browsing properties and save your favorites here</p>
            <Link
              to="/properties"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritesList.map((fav) => {
              // Backend returns favorite object with `property` nested
              const raw = fav.property || fav.property_id || null;
              if (!raw) return null;
              // Normalize so components expect `_id` and `property_id`
              const propertyObj = {
                ...raw,
                _id: raw.property_id ?? raw._id ?? raw.id,
                property_id: raw.property_id ?? raw._id ?? raw.id,
              };
              const key = fav.favorite_id || fav._id || propertyObj._id || Math.random();
              return <PropertyCard key={String(key)} property={propertyObj} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

