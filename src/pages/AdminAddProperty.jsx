import { useEffect, useState, useRef } from "react";
import AdminLayout from "../components/AdminLayout";
import { useDispatch, useSelector } from "react-redux";
import { createProperty } from "../redux/slices/propertySlice";
import { fetchCategories } from "../redux/slices/categorySlice";
import { fetchLocations } from "../redux/slices/locationSlice";
import { useNavigate } from "react-router-dom";

export default function AdminAddProperty() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: categories } = useSelector((s) => s.categories);
  const { list: locations } = useSelector((s) => s.locations);
  const fileInputRef = useRef(null);

  const categoriesList = Array.isArray(categories) ? categories : [];
  const locationsList = Array.isArray(locations) ? locations : [];

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    property_type: "sale",
    category_id: "",
    location_id: "",
    status: "pending",
    bedrooms: "",
    bathrooms: "",
    area_sqft: "",
    year_built: "",
    parking_spots: "",
    has_garden: false,
    has_pool: false,
    pet_friendly: false,
    furnished: false,
    is_featured: false,
    address: "",
    imagesFiles: [],
    imagePreviews: [],
  });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchLocations());
  }, [dispatch]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onCheckboxChange = (e) => setForm({ ...form, [e.target.name]: e.target.checked });

  const MAX_IMAGES = 7;

  const onFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Create new files array (max 4 total)
    const currentFiles = form.imagesFiles || [];
    const remainingSlots = MAX_IMAGES - currentFiles.length;
    const newFiles = files.slice(0, remainingSlots);
    const allFiles = [...currentFiles, ...newFiles];

    // Create previews
    const newPreviews = allFiles.map(file => URL.createObjectURL(file));

    setForm(prev => ({
      ...prev,
      imagesFiles: allFiles,
      imagePreviews: newPreviews
    }));
  };

  const removeImage = (index) => {
    const newFiles = form.imagesFiles.filter((_, i) => i !== index);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    // Revoke old preview URL to avoid memory leaks
    URL.revokeObjectURL(form.imagePreviews[index]);
    
    setForm(prev => ({
      ...prev,
      imagesFiles: newFiles,
      imagePreviews: newPreviews
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    const currentFiles = form.imagesFiles || [];
    const remainingSlots = MAX_IMAGES - currentFiles.length;
    const newFiles = files.slice(0, remainingSlots);
    const allFiles = [...currentFiles, ...newFiles];

    const newPreviews = allFiles.map(file => URL.createObjectURL(file));

    setForm(prev => ({
      ...prev,
      imagesFiles: allFiles,
      imagePreviews: newPreviews
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    
    // Debug: Log files before appending
    console.log("Images files:", form.imagesFiles);
    console.log("Number of files:", form.imagesFiles?.length || 0);
    
    if (form.imagesFiles && form.imagesFiles.length > 0) {
      form.imagesFiles.forEach((file, index) => {
        console.log(`File ${index}:`, file.name, file.size, file.type);
        fd.append('property_images', file);
      });
    }
    fd.append('property_title', form.title || '');
    fd.append('property_description', form.description || '');
    fd.append('price', String(form.price || '0'));
    fd.append('property_type', String(form.property_type || '1'));
    if (form.category_id) {
      const rawCat = form.category_id;
      const numericCatId = Number(rawCat);
      let finalCatId = null;
      if (!Number.isNaN(numericCatId) && numericCatId !== 0) finalCatId = numericCatId;
      else {
        const found = categoriesList.find((c) => (c.category_id && String(c.category_id) === rawCat) || (c._id && String(c._id) === rawCat) || (c.category_name && c.category_name === rawCat) || (c.name && c.name === rawCat));
        if (found) finalCatId = found.category_id || found._id || found.id;
      }
      if (finalCatId != null) fd.append('category_id', String(finalCatId));
    }
    if (form.location_id) {
      const rawLoc = form.location_id;
      const numericLocId = Number(rawLoc);
      let finalLocId = null;
      if (!Number.isNaN(numericLocId) && numericLocId !== 0) finalLocId = numericLocId;
      else {
        const found = locationsList.find((l) => (l.location_id && String(l.location_id) === rawLoc) || (l._id && String(l._id) === rawLoc) || (l.city && l.city === rawLoc) || (l.location_name && l.location_name === rawLoc));
        if (found) finalLocId = found.location_id || found._id || found.id;
      }
      if (finalLocId != null) fd.append('location_id', String(finalLocId));
    }
    fd.append('property_status', form.status || 'available');
    fd.append('bedrooms', String(form.bedrooms || '0'));
    fd.append('bathrooms', String(form.bathrooms || '0'));
    fd.append('area_sqft', String(form.area_sqft || '0'));
    fd.append('address', form.address || '');
    if (form.year_built) fd.append('year_built', String(form.year_built));
    if (form.parking_spots) fd.append('parking_spots', String(form.parking_spots));
    fd.append('has_garden', String(form.has_garden));
    fd.append('has_pool', String(form.has_pool));
    fd.append('pet_friendly', String(form.pet_friendly));
    fd.append('furnished', String(form.furnished));
    fd.append('is_featured', String(form.is_featured));

    const res = await dispatch(createProperty(fd));
    if (res.error) {
      alert(res.error.message || res.error || "Failed to create property");
      return;
    }
    navigate("/admin/properties");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Property</h1>
        
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input name="title" value={form.title} onChange={onChange} placeholder="Property title" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input name="price" value={form.price} onChange={onChange} type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select name="property_type" value={form.property_type} onChange={onChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" value={form.status} onChange={onChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="pending">Pending</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={onChange} rows={3} placeholder="Property description..." className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" />
            </div>
          </div>

          {/* Location & Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Location & Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category_id" value={form.category_id} onChange={onChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">Select category</option>
                  {categoriesList.map((c) => (
                    <option key={c.category_id || c._id || c.id} value={c.category_id || c._id || c.id}>
                      {c.category_name || c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select name="location_id" value={form.location_id} onChange={onChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">Select location</option>
                  {locationsList.map((l) => (
                    <option key={l.location_id || l._id || l.id} value={l.location_id || l._id || l.id}>
                      {l.city || l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input name="address" value={form.address} onChange={onChange} placeholder="Full address" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Property Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input name="bedrooms" value={form.bedrooms} onChange={onChange} type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input name="bathrooms" value={form.bathrooms} onChange={onChange} type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqft)</label>
                <input name="area_sqft" value={form.area_sqft} onChange={onChange} type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                <input name="year_built" value={form.year_built} onChange={onChange} type="number" placeholder="2024" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: "has_garden", label: "Garden" },
                  { name: "has_pool", label: "Swimming Pool" },
                  { name: "pet_friendly", label: "Pet Friendly" },
                  { name: "furnished", label: "Furnished" },
                  { name: "is_featured", label: "Featured" },
                ].map(({ name, label }) => (
                  <label key={name} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name={name} checked={form[name]} onChange={onCheckboxChange} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Property Images (Max {MAX_IMAGES})</h2>
            
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={triggerFileInput}
            >
              <input 
                ref={fileInputRef}
                name="property_images" 
                onChange={onFilesChange} 
                multiple 
                type="file" 
                accept="image/*" 
                className="hidden" 
              />
              
              {form.imagePreviews.length === 0 ? (
                <div className="py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium mb-1">Click or drag images here</p>
                  <p className="text-sm text-gray-400">Upload up to {MAX_IMAGES} images</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {form.imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {index + 1} / {form.imagePreviews.length}
                      </div>
                    </div>
                  ))}
                  
                  {form.imagePreviews.length < MAX_IMAGES && (
                    <div 
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerFileInput();
                      }}
                    >
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-1 bg-gray-200 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-500">Add more</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {form.imagePreviews.length > 0 && (
              <p className="text-sm text-gray-500 mt-3 text-center">
                {form.imagePreviews.length} of {MAX_IMAGES} images uploaded
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => navigate("/admin/properties")} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm">
              Create Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
