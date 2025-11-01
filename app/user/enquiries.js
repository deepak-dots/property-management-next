'use client';

import { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import { useRouter } from "next/router";
import UserSidebar from "../../components/UserSidebar";

export default function EnquiriesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        router.push("/user/login");
        return;
      }

      const res = await axios.get("/quotes/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setQuotes(res.data);
    } catch (err) {
      console.error("Error fetching quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UserSidebar />

      <main className="flex-1 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">My Enquiries</h1>

          {loading ? (
            <p className="text-gray-500 text-center">Loading enquiries...</p>
          ) : quotes.length === 0 ? (
            <p className="text-gray-500 text-center">No enquiries found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border text-left">Property</th>
                    <th className="p-2 border text-left">Name</th>
                    <th className="p-2 border text-left">Email</th>
                    <th className="p-2 border text-left">Contact Number</th>
                    <th className="p-2 border text-left">Message</th>
                    <th className="p-2 border text-left">Date</th>
                    <th className="p-2 border text-left">View</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q) => (
                    <tr key={q._id} className="hover:bg-gray-50">
                      <td className="p-2 border">
                        {q.propertyId ? (
                          <>
                            {q.propertyId.title || q.propertyId.name} <br />
                          </>
                        ) : (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="p-2 border">{q.name}</td>
                      <td className="p-2 border">{q.email}</td>
                      <td className="p-2 border">{q.contactNumber}</td>
                      <td className="p-2 border">{q.message}</td>
                      <td className="p-2 border">{new Date(q.createdAt).toLocaleDateString()}</td>
                      <td className="p-2 border">
                        <a
                          href={`/properties/${q.propertyId ? q.propertyId._id : ""}`}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
