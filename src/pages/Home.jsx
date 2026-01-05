import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProperties } from "../redux/slices/propertySlice";
import { fetchCategories } from "../redux/slices/categorySlice";
import { fetchLocations } from "../redux/slices/locationSlice";
import PropertyCard from "../components/PropertyCard";

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: properties, loading } = useSelector((state) => state.properties);
  const { list: categories } = useSelector((state) => state.categories);
  const { list: locations } = useSelector((state) => state.locations);
  const { user, token } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    // If admin is signed in, send them to the admin dashboard.
    // Do NOT redirect regular users away from the public Home page — they should see Home after login.
    if (token && user) {
      const userRole = user?.user_role || user?.role;
      if (userRole === "admin") {
        navigate("/admin/dashboard");
      }
    }
  }, [token, user, navigate]);

  useEffect(() => {
    dispatch(fetchProperties({}));
    dispatch(fetchCategories());
    dispatch(fetchLocations());
  }, [dispatch]);


  const propertiesList = Array.isArray(properties) ? properties : [];
  const categoriesList = Array.isArray(categories) ? categories : [];
  const locationsList = Array.isArray(locations) ? locations : [];
  const featuredProperties = propertiesList.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Dream Property
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover the perfect home, apartment, or commercial space from our extensive collection of properties.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2 shadow-xl">
                <div className="relative flex-1">
                  <svg 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by location, property type..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/properties?search=${search}`)}
                    className="
                      w-full
                      pl-12
                      pr-6
                      py-4
                      rounded-lg
                      bg-white
                      text-gray-900
                      placeholder-gray-400
                      border border-gray-200
                      focus:outline-none
                      focus:ring-2
                      focus:ring-indigo-500
                      focus:border-transparent
                      shadow-sm
                      transition-all
                    "
                  />
                </div>
                <Link
                  to={`/properties?search=${search}`}
                  className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoriesList.map((cat) => (
              <Link
                key={cat.category_id}
                to={`/properties?category=${cat.category_id}`}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-center"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">{cat.category_name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Properties</h2>
            <Link to="/properties" className="text-indigo-600 hover:text-indigo-700 font-medium">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Locations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {locationsList.slice(0, 8).map((loc) => (
              <Link
                key={loc.location_id}
                to={`/properties?location=${loc.location_id}`}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-900">{loc.city}</h3>
                <p className="text-sm text-gray-500">{loc.state}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Perfect Home?</h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            Browse thousands of properties and find the one that matches your lifestyle and budget.
          </p>
          <Link
            to="/properties"
            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Browse Properties
          </Link>
        </div>
      </section>
    </div>
  );
}

