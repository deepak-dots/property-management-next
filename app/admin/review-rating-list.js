import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "../../utils/axiosInstance";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminReviewList() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [propertiesMap, setPropertiesMap] = useState({});
  const [loading, setLoading] = useState(true);

  // ------------------- LOGOUT -------------------
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.dispatchEvent(new Event("logout"));
    router.push("/admin/login");
  };


  const handleApprove = async (id, approved) => {
    try {
      await axios.put(`/reviews/${id}/approve`, { approved });
      toast.success(`Review ${approved ? 'approved' : 'hidden'} successfully`);
      fetchReviews();
    } catch (err) {
      toast.error("Error updating review status");
    }
  };

  
  // ------------------- FETCH REVIEWS -------------------
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      // ✅ Get all reviews (from backend route `/api/properties/reviews`)
      const res = await axios.get("/properties/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allReviews = Array.isArray(res.data) ? res.data : [];
      setReviews(allReviews);

      // ✅ Create property map to avoid repeated API calls
      const propertyDetails = {};
      allReviews.forEach((r) => {
        if (!propertyDetails[r.propertyId]) {
          propertyDetails[r.propertyId] = {
            title: r.propertyTitle || "No Title",
            city: r.propertyCity || "",
          };
        }
      });

      setPropertiesMap(propertyDetails);
    } catch (error) {
      console.error("❌ Error fetching reviews:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- TOGGLE APPROVAL -------------------
  const toggleApproval = async (propertyId, reviewId, approved) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(
        `/properties/${propertyId}/reviews/${reviewId}/approval`,
        { approved },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReviews();
    } catch (err) {
      console.error("❌ Error updating approval:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // ------------------- RENDER -------------------
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar onLogout={handleLogout} />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Review & Rating List
            </h1>
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Back to Dashboard
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500">No reviews found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border text-left">User Name</th>
                    <th className="p-2 border text-left">Message</th>
                    <th className="p-2 border text-center">Rating</th>
                    <th className="p-2 border text-left">Property</th>
                    <th className="p-2 border text-center">Status</th>
                    <th className="p-2 border text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => {
                    const property = propertiesMap[review.propertyId];
                    return (
                      <tr key={review._id} className="hover:bg-gray-50">
                        <td className="p-2 border">{review.name}</td>
                        <td className="p-2 border">{review.message}</td>
                        <td className="p-2 border text-center">{review.rating}</td>
                        <td className="p-2 border">
                          {property
                            ? `${property.title}${property.city ? `, ${property.city}` : ""}`
                            : "N/A"}
                        </td>
                        <td className="p-2 border text-center">
                          {review.approved ? "Publish" : "Draft"}
                        </td>
                        <td className="p-2 border text-center">
                          <button
                            onClick={() =>
                              toggleApproval(review.propertyId, review._id, !review.approved)
                            }
                            className={`px-3 py-1 rounded ${
                              review.approved
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-green-500 hover:bg-green-600"
                            } text-white`}
                          >
                            {review.approved ? "Draft" : "Publish"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
