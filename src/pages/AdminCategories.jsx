import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCategories, deleteCategory } from "../redux/slices/categorySlice";

export default function AdminCategories() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: categories, loading } = useSelector((state) => state.categories);

  // Safe array variables
  const categoriesList = Array.isArray(categories) ? categories : [];
  
  // Calculate stats
  const totalCategories = categoriesList.length;
  const activeCategories = categoriesList.filter(c => c.category_status === "active").length;
  const inactiveCategories = categoriesList.filter(c => c.category_status === "inactive").length;

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (!id) {
      alert("Cannot delete category: missing id");
      return;
    }
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await dispatch(deleteCategory(id)).unwrap();
      dispatch(fetchCategories());
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert(typeof err === "string" ? err : "Failed to delete category");
    }
  };

  // Get status badge styling with icons
  const getStatusBadge = (status) => {
    if (status === "active") {
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

  // Category Card Component
  const CategoryCard = ({ category }) => {
    const statusInfo = getStatusBadge(category.category_status);
    const categoryId = category._id || category.id;
    const categoryName = category.category_name;

    return (
      <div className="admin-card admin-card-hover p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{categoryName}</h3>
              <p className="text-xs text-slate-500">ID: {categoryId?.slice(-6) || "N/A"}</p>
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
            onClick={() => navigate(`/admin/categories/edit/${categoryId}`)}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
            disabled={!categoryId}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => handleDelete(categoryId)}
            className="flex-1 btn-danger flex items-center justify-center gap-2"
            disabled={!categoryId}
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
          title="Total Categories"
          value={totalCategories}
          icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          colorClass="bg-indigo-100 text-indigo-600"
          bgClass="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100"
        />
        <StatsCard
          title="Active Categories"
          value={activeCategories}
          icon="M5 13l4 4L19 7"
          colorClass="bg-emerald-100 text-emerald-600"
          bgClass="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100"
        />
        <StatsCard
          title="Inactive Categories"
          value={inactiveCategories}
          icon="M6 18L18 6M6 6l12 12"
          colorClass="bg-slate-100 text-slate-600"
          bgClass="bg-gradient-to-br from-slate-100 to-gray-50 border-slate-200"
        />
      </div>

      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500">Manage property categories</p>
        </div>
        <button
          onClick={() => navigate("/admin/categories/add")}
          className="ml-auto btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500">Loading categories...</p>
          </div>
        ) : categoriesList.length === 0 ? (
          <div className="col-span-full">
            <div className="empty-state py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="empty-state-title">No Categories Found</h3>
              <p className="empty-state-text">Start by adding your first category.</p>
              <button
                onClick={() => navigate("/admin/categories/add")}
                className="mt-4 btn-primary"
              >
                Add First Category
              </button>
            </div>
          </div>
        ) : (
          categoriesList.map((category) => (
            <CategoryCard key={category._id || category.id} category={category} />
          ))
        )}
      </div>
    </div>
  );
}

