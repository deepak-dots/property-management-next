// pages/admin/cms-pages/[id].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "../../../utils/axiosInstance";
import AdminSidebar from "../../../components/AdminSidebar";
import PageForm from "../../../components/PageForm";

export default function EditPage() {
  const router = useRouter();
  const { id } = router.query; // MongoDB _id

  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState(false); // Modal state
  const [pendingData, setPendingData] = useState(null); // Data waiting for confirmation

  useEffect(() => {
    if (!id) return; // wait for id from router

    async function fetchPage() {
      try {
        // Use /pages/id/:id route
        const res = await axios.get(`/pages/id/${id}`);
        setPageData(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch page");
        setLoading(false);
      }
    }

    fetchPage();
  }, [id]);

  // Called by PageForm on submit
  const handleSubmit = (data) => {
    setPendingData(data); // store data waiting for confirmation
    setConfirmModal(true); // show modal
  };

  // Confirmed save
  const handleConfirmSave = async () => {
    if (!pendingData) return;
    setSaving(true);
    setError("");
    try {
      await axios.put(`/pages/${id}`, pendingData);
      router.push("/admin/cms-pages/pages"); // redirect to pages list
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
      setConfirmModal(false);
      setPendingData(null);
    }
  };

  if (loading) return <p className="p-6">Loading page...</p>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Page</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* PageForm component */}
        <PageForm
          initialData={pageData}
          onSubmit={handleSubmit} // changed to show confirmation first
          loading={saving}
        />
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Confirm Save</h2>
            <p className="mb-6">
              Are you sure you want to save changes to "{pageData.title}"?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setConfirmModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
