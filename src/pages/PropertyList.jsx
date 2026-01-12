import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProperties } from "../redux/slices/propertySlice";
import { fetchCategories } from "../redux/slices/categorySlice";
import { fetchLocations } from "../redux/slices/locationSlice";
import { fetchFavorites } from "../redux/slices/favoriteSlice";
import PropertyCard from "../components/PropertyCard";

// Separate FiltersContent component to prevent unnecessary re-renders
function FiltersContent({ filters, categoriesList, locationsList, handleFilterChange }) {
  const priceSliderRef = useRef(null);
  const minPriceInputRef = useRef(null);
  const maxPriceInputRef = useRef(null);

  // Handle click on slider to determine which thumb to move
  const handleSliderClick = useCallback((e) => {
    if (!priceSliderRef.current) return;

    const rect = priceSliderRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const sliderWidth = rect.width;
    const clickPercentage = Math.max(0, Math.min(clickX / sliderWidth, 1));
    const clickValue = clickPercentage * 10000000;

    // Get current values with proper clamping
    const currentMinPrice = Math.max(0, Math.min(filters.minPrice || 0, 10000000));
    const currentMaxPrice = Math.max(0, Math.min(filters.maxPrice || 10000000, 10000000));
    const midPoint = (currentMinPrice + currentMaxPrice) / 2;

    // If clicking on the left half, move min price; otherwise move max price
    if (clickValue < midPoint) {
      // Move min price slider
      if (minPriceInputRef.current) {
        const clampedValue = Math.max(0, Math.min(clickValue, currentMaxPrice - 50000));
        minPriceInputRef.current.value = clampedValue;
        handleFilterChange("minPrice", clampedValue);
      }
    } else {
      // Move max price slider
      if (maxPriceInputRef.current) {
        const clampedValue = Math.min(10000000, Math.max(clickValue, currentMinPrice + 50000));
        maxPriceInputRef.current.value = clampedValue;
        handleFilterChange("maxPrice", clampedValue);
      }
    }
  }, [filters, handleFilterChange]);

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
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Price Range
        </label>

        {/* Slider */}
        <div 
          className="relative h-10 flex items-center cursor-pointer select-none" 
          ref={priceSliderRef}
          onMouseDown={handleSliderClick}
          onClick={handleSliderClick}
        >
          {/* Track background */}
          <div className="absolute left-0 right-0 h-2 bg-gray-200 rounded-full pointer-events-none"></div>
          
          {/* Active range */}
          <div 
            className="absolute h-2 bg-indigo-700 rounded-full z-10 pointer-events-none"
            style={{
              left: `${(Math.max(0, Math.min(filters.minPrice || 0, 10000000)) / 10000000) * 100}%`,
              right: `${100 - (Math.max(0, Math.min(filters.maxPrice || 10000000, 10000000)) / 10000000) * 100}%`
            }}
          ></div>

          {/* Min Price Slider - pointer-events-none so container handles all interactions */}
          <input
            ref={minPriceInputRef}
            type="range"
            min="0"
            max="10000000"
            step="50000"
            value={Math.max(0, Math.min(filters.minPrice || 0, 10000000))}
            onChange={(e) => {
              const value = Math.max(0, Math.min(Number(e.target.value), Math.max(0, Math.min(filters.maxPrice || 10000000, 10000000)) - 50000));
              handleFilterChange("minPrice", value);
            }}
            className="absolute w-full h-2 appearance-none bg-transparent z-20 cursor-pointer range-slider-min pointer-events-none"
            style={{ pointerEvents: 'none' }}
          />

          {/* Max Price Slider - pointer-events-none so container handles all interactions */}
          <input
            ref={maxPriceInputRef}
            type="range"
            min="0"
            max="10000000"
            step="50000"
            value={Math.max(0, Math.min(filters.maxPrice || 10000000, 10000000))}
            onChange={(e) => {
              const value = Math.min(10000000, Math.max(Number(e.target.value), Math.max(0, Math.min(filters.minPrice || 0, 10000000)) + 50000));
              handleFilterChange("maxPrice", value);
            }}
            className="absolute w-full h-2 appearance-none bg-transparent z-10 cursor-pointer range-slider-max pointer-events-none"
            style={{ pointerEvents: 'none' }}
          />
        </div>

        {/* From / To Input Boxes */}
        <div className="flex gap-3 mt-6">
          <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
            <label className="text-xs text-gray-500 font-medium">From :</label>
            <div className="flex items-center mt-1">
              <span className="text-gray-500 font-semibold mr-1">₹</span>
              <input
                type="number"
                min="0"
                max="10000000"
                step="50000"
                value={Math.min(filters.minPrice || 0, 10000000)}
                onChange={(e) => {
                  const rawValue = e.target.value;
                  const value = Number(rawValue);
                  // Validate: must be between 0 and 10000000, and not negative
                  if (!isNaN(value) && value >= 0 && value <= 10000000) {
                    handleFilterChange("minPrice", Math.min(value, Math.min(filters.maxPrice || 10000000, 10000000) - 50000));
                  }
                }}
                onKeyDown={(e) => {
                  // Prevent negative sign
                  if (e.key === '-') {
                    e.preventDefault();
                  }
                }}
                className="w-full bg-transparent font-semibold text-gray-800 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
            <label className="text-xs text-gray-500 font-medium">To :</label>
            <div className="flex items-center mt-1">
              <span className="text-gray-500 font-semibold mr-1">₹</span>
              <input
                type="number"
                min="0"
                max="10000000"
                step="50000"
                value={Math.min(filters.maxPrice || 10000000, 10000000)}
                onChange={(e) => {
                  const rawValue = e.target.value;
                  const value = Number(rawValue);
                  // Validate: must be between 0 and 10000000
                  if (!isNaN(value) && value >= 0 && value <= 10000000) {
                    handleFilterChange("maxPrice", Math.max(value, Math.max(filters.minPrice || 0, 0) + 50000));
                  }
                }}
                onKeyDown={(e) => {
                  // Prevent values above 10000000 by blocking extra digits
                  const currentValue = e.target.value;
                  if (currentValue.length >= 8 && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                    // Allow but validate on change
                  }
                }}
                className="w-full bg-transparent font-semibold text-gray-800 focus:outline-none"
                placeholder="10,000,000"
              />
            </div>
          </div>
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

  // Helper function to validate and clamp price values
  const validatePrice = (value, defaultVal, minVal = 0, maxVal = 10000000) => {
    const num = Number(value);
    if (isNaN(num) || num < minVal) return minVal;
    if (num > maxVal) return maxVal;
    return num;
  };

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    location: searchParams.get("location") || "",
    propertyType: searchParams.get("type") || "",
    minPrice: validatePrice(searchParams.get("minPrice"), 0),
    maxPrice: validatePrice(searchParams.get("maxPrice"), 10000000),
  });

  // Memoized handleFilterChange - now validates and clamps price values
  const handleFilterChange = useCallback((key, value) => {
    if (key === "reset") {
      setFilters({
        search: "",
        category: "",
        location: "",
        propertyType: "",
        minPrice: 0,
        maxPrice: 10000000,
      });
    } else if (key === "minPrice") {
      // Validate minPrice: must be between 0 and 10000000, and less than maxPrice
      const maxPriceVal = filters.maxPrice || 10000000;
      const clampedValue = Math.max(0, Math.min(Number(value) || 0, maxPriceVal - 50000));
      setFilters((prev) => ({ ...prev, minPrice: clampedValue }));
    } else if (key === "maxPrice") {
      // Validate maxPrice: must be between 0 and 10000000, and greater than minPrice
      const minPriceVal = filters.minPrice || 0;
      const clampedValue = Math.min(10000000, Math.max(Number(value) || 0, minPriceVal + 50000));
      setFilters((prev) => ({ ...prev, maxPrice: clampedValue }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  }, [filters.minPrice, filters.maxPrice]);

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
    // Fetch favorites for showing heart icons
    dispatch(fetchFavorites());
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

