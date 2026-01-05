import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProperties } from "../redux/slices/propertySlice";
import { fetchCategories } from "../redux/slices/categorySlice";
import { fetchLocations } from "../redux/slices/locationSlice";
import PropertyCard from "../components/PropertyCard";

// Separate FiltersContent component to prevent unnecessary re-renders
function FiltersContent({ filters, categoriesList, locationsList, handleFilterChange }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button
          onClick={() =>
            handleFilterChange("reset", null)
          }
          className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition"
        >
          Reset
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <div className="relative">
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
            placeholder="Search properties..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
        >
          <option value="">All Categories</option>
          {categoriesList.map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.category_name}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          value={filters.location}
          onChange={(e) => handleFilterChange("location", e.target.value)}
        >
          <option value="">All Locations</option>
          {locationsList.map((loc) => (
            <option key={loc.location_id} value={loc.location_id}>
              {loc.city}, {loc.state}
            </option>
          ))}
        </select>
      </div>

      {/* Property Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          value={filters.propertyType}
          onChange={(e) => handleFilterChange("propertyType", e.target.value)}
        >
          <option value="">All Types</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default function PropertyList() {
  const dispatch = useDispatch();
  const { list: allProperties, loading, totalPages, currentPage } = useSelector((state) => state.properties);
  const { list: categories } = useSelector((state) => state.categories);
  const { list: locations } = useSelector((state) => state.locations);

  // Safe array variables
  const categoriesList = Array.isArray(categories) ? categories : [];
  const locationsList = Array.isArray(locations) ? locations : [];
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    location: searchParams.get("location") || "",
    propertyType: searchParams.get("type") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  // Memoized handleFilterChange
  const handleFilterChange = useCallback((key, value) => {
    if (key === "reset") {
      setFilters({
        search: "",
        category: "",
        location: "",
        propertyType: "",
        minPrice: "",
        maxPrice: "",
      });
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  }, []);

  // Client-side filtered properties
  const properties = useMemo(() => {
    let filtered = [...allProperties];

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((p) =>
        p.property_title?.toLowerCase().includes(searchLower) ||
        p.property_description?.toLowerCase().includes(searchLower) ||
        p.address?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter((p) => {
        const raw = p.raw;
        if (raw) {
          return String(raw.category_id) === String(filters.category);
        }
        const catId = p.category_id;
        if (catId === null || catId === undefined) return false;
        const propCatId = typeof catId === 'object' ? catId._id || catId.category_id || catId.id : catId;
        return String(propCatId) === String(filters.category);
      });
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter((p) => {
        const raw = p.raw;
        if (raw) {
          return String(raw.location_id) === String(filters.location);
        }
        const locId = p.location_id;
        if (locId === null || locId === undefined) return false;
        const propLocId = typeof locId === 'object' ? locId._id || locId.location_id || locId.id : locId;
        return String(propLocId) === String(filters.location);
      });
    }

    // Filter by property type
    if (filters.propertyType) {
      filtered = filtered.filter((p) => {
        const raw = p.raw;
        if (raw) {
          return raw.property_type?.toLowerCase() === filters.propertyType.toLowerCase();
        }
        return p.property_type?.toLowerCase() === filters.propertyType.toLowerCase();
      });
    }

    // Filter by min price
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter((p) => (p.price || 0) >= minPrice);
    }

    // Filter by max price
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter((p) => (p.price || 0) <= maxPrice);
    }

    return filtered;
  }, [allProperties, filters]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchLocations());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProperties({}));
  }, [dispatch]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.location) params.set("location", filters.location);
    if (filters.propertyType) params.set("type", filters.propertyType);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handlePageChange = (page) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Properties</h1>

        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {showFiltersMobile ? 'Hide Filters' : 'Show Filters'}
        </button>

        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FiltersContent 
              filters={filters} 
              categoriesList={categoriesList} 
              locationsList={locationsList} 
              handleFilterChange={handleFilterChange}
            />
          </aside>

          {/* Mobile Filters Drawer */}
          {showFiltersMobile && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div 
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setShowFiltersMobile(false)}
              />
              <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-xl overflow-y-auto">
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button
                    onClick={() => setShowFiltersMobile(false)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <FiltersContent 
                    filters={filters} 
                    categoriesList={categoriesList} 
                    locationsList={locationsList} 
                    handleFilterChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Property Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-500">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property._id} property={property} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2 overflow-x-auto pb-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg flex-shrink-0 ${
                          page === currentPage
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

