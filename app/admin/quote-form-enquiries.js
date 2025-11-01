// pages/admin/enquiries.js 
import { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import { useRouter } from "next/router";
import AdminSidebar from "../../components/AdminSidebar";

export default function EnquiriesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [propertiesMap, setPropertiesMap] = useState({});

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.dispatchEvent(new Event("logout"));
    router.push("/admin/login");
  };

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const res = await axios.get("/quotes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuotes(res.data);

      const uniquePropertyIds = [...new Set(res.data.map((q) => q.propertyId))];
      const propertyDetails = {};

      await Promise.all(
        uniquePropertyIds.map(async (id) => {
          try {
            const propRes = await axios.get(`/properties/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            propertyDetails[id] = {
              title: propRes.data.title || "No Title",
              city: propRes.data.city || "",
              url: `/properties/${id}`,
            };
          } catch (err) {
            propertyDetails[id] = { title: "Property Not Found", city: "", url: "#" };
          }
        })
      );

      setPropertiesMap(propertyDetails);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar onLogout={handleLogout} />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Enquiry Contact List</h1>
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Back to Dashboard
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading enquiries...</p>
          ) : quotes.length === 0 ? (
            <p className="text-gray-500">No enquiries found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border text-left">Name</th>
                    <th className="p-2 border text-left">Email</th>
                    <th className="p-2 border text-left">Contact Number</th>
                    <th className="p-2 border text-left">Message</th>
                    <th className="p-2 border text-left">Property</th>
                    <th className="p-2 border text-left">Date</th>
                    <th className="p-2 border text-left">View</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((quote) => {
                    const property = propertiesMap[quote.propertyId];
                    return (
                      <tr key={quote._id} className="hover:bg-gray-50">
                        <td className="p-2 border">{quote.name}</td>
                        <td className="p-2 border">{quote.email}</td>
                        <td className="p-2 border">{quote.contactNumber}</td>
                        <td className="p-2 border">{quote.message}</td>
                        <td className="p-2 border">
                          {property
                            ? `${property.title}${property.city ? `, ${property.city}` : ""}`
                            : "Loading..."}
                        </td>
                        <td className="p-2 border">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-2 border">
                          {property && property.url !== "#" ? (
                            <a
                              href={property.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center"
                              aria-label="View Property"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </a>
                          ) : (
                            "N/A"
                          )}
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
