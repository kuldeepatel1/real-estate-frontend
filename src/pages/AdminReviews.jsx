import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/reviews/pending");
      setReviews(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      await api.post(`/api/admin/reviews/${reviewId}/approve`);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve review");
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/api/reviews/${reviewId}`);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete review");
    }
  };

  const getPropertyInfo = (review) => {
    if (review.property_id?.property_title) {
      return review.property_id.property_title;
    }
    if (review.property_title) {
      return review.property_title;
    }
    return `Property #${review.property_id || review.propertyId || "Unknown"}`;
  };

  const getUserInfo = (review) => {
    if (review.user_id?.user_name) {
      return review.user_id.user_name;
    }
    if (review.user_name) {
      return review.user_name;
    }
    return `User #${review.user_id || "Unknown"}`;
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= (rating || 0) ? "text-yellow-400" : "text-gray-200"}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700">{rating || 0}</span>
      </div>
    );
  };

  // Review Card Component for Mobile
  const ReviewCard = ({ review }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-gray-900 truncate">
            {getPropertyInfo(review)}
          </h4>
          <p className="text-sm text-gray-500">
            by {getUserInfo(review)}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
          review.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
        }`}>
          {review.is_approved ? "Approved" : "Pending"}
        </span>
      </div>

      <div className="mb-3">
        {renderStars(review.rating)}
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {review.comment || "No comment"}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {review.created_date 
            ? new Date(review.created_date).toLocaleDateString()
            : "N/A"}
        </span>
        <div className="flex gap-2">
          {!review.is_approved && (
            <button
              onClick={() => handleApprove(review.review_id || review._id)}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition font-medium"
            >
              Approve
            </button>
          )}
          <button
            onClick={() => handleDelete(review.review_id || review._id)}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
        <p className="text-gray-500">Manage and approve property reviews</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && reviews.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="text-gray-500 text-lg">No pending reviews</p>
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && !error && reviews.length > 0 && (
        <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Property</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">User</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Rating</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Comment</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <tr key={review.review_id || review._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {getPropertyInfo(review)}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {review.property_id || review.propertyId}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {getUserInfo(review)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {renderStars(review.rating)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-600 max-w-xs truncate">
                      {review.comment || "No comment"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500">
                      {review.created_date 
                        ? new Date(review.created_date).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      review.is_approved
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {review.is_approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {!review.is_approved && (
                        <button
                          onClick={() => handleApprove(review.review_id || review._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review.review_id || review._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && !error && reviews.length > 0 && (
        <div className="lg:hidden space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.review_id || review._id} review={review} />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

