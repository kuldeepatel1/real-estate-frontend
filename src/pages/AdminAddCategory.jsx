import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCategories, createCategory, updateCategory } from "../redux/slices/categorySlice";

export default function AdminAddCategory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { list: categories } = useSelector((state) => state.categories);
  const editing = !!id;

  const [form, setForm] = useState({ name: "", status: "active" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (editing && categories.length > 0) {
      const category = categories.find(c => c._id === id || c.id === id || c.category_id === id);
      if (category) {
        setForm({
          name: category.category_name,
          status: category.category_status || "active"
        });
      }
    }
  }, [editing, id, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = { category_name: form.name, category_status: form.status };
    
    try {
      if (editing) {
        await dispatch(updateCategory({ id, data: payload })).unwrap();
      } else {
        await dispatch(createCategory(payload)).unwrap();
      }
      navigate("/admin/categories");
    } catch (err) {
      console.error("Failed to save category:", err);
      alert(typeof err === "string" ? err : "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/categories");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {editing ? "Edit Category" : "Add New Category"}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Category Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : (editing ? "Update Category" : "Create Category")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

