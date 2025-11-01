import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from '../../../utils/axiosInstance';
import PropertyForm from '../../../components/PropertyForm';
import Sidebar from '../../../components/AdminSidebar';

function ConfirmationModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg animate-fade-in">
        <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditPropertyPage() {
  const router = useRouter();
  const { id } = router.query;

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const openConfirm = () => setConfirmOpen(true);
  const closeConfirm = () => setConfirmOpen(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) router.replace('/admin/login');
    if (!id) return;

    const fetchProperty = async () => {
      try {
        const res = await axios.get(`/properties/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInitialData(res.data);
      } catch (error) {
        console.error('Failed to fetch property:', error);
        alert('Failed to load property data.');
        router.push('/admin/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, router]);

  const handleSuccess = () => router.push('/admin/dashboard');

  const handleDeleteConfirmed = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) router.push('/admin/login');

      await axios.delete(`/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      closeConfirm();
      router.push('/admin/dashboard');
    } catch (error) {
      closeConfirm();
      alert('Failed to delete property.');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500 text-xl">
        Loading property data...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-8 space-y-6">

          {initialData ? (
            <>

            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold mb-6 text-gray-800">
                Edit Property
              </h1>

              <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Back to Dashboard
            </button>
            </div>

              <PropertyForm
                initialData={initialData}
                isEdit={true}
                onSuccess={handleSuccess}
              />

              <div className="mt-6 flex justify-end">
                <button
                  onClick={openConfirm}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow transition"
                >
                  Delete Property
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-red-500 font-medium">Property data not found.</p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmOpen}
        message="Are you sure you want to delete this property?"
        onConfirm={handleDeleteConfirmed}
        onCancel={closeConfirm}
      />
    </div>
  );
}
