import { useRouter } from 'next/router';
import axios from '../utils/axiosInstance';
import { useState } from 'react';

const ActionIcons = ({ propertyId, hideEdit = false }) => {
  const router = useRouter();
  const [modal, setModal] = useState({
    isOpen: false,
    type: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: '', message: '', onConfirm: null, onCancel: null });
  };

  const showConfirm = (message, onConfirm) => {
    setModal({
      isOpen: true,
      type: 'confirm',
      message,
      onConfirm: () => {
        closeModal();
        onConfirm();
      },
      onCancel: () => closeModal(),
    });
  };

  const showInfo = (message, onConfirm = null) => {
    setModal({
      isOpen: true,
      type: 'info',
      message,
      onConfirm,
      onCancel: null,
    });
  };

  const handleDelete = () => {
    showConfirm('Are you sure you want to delete this property?', async () => {
      try {
        await axios.delete(`/properties/${propertyId}`, {
          headers: getAuthHeaders(),
        });
        showInfo('Property deleted.', () => router.push('/admin/dashboard'));
      } catch (error) {
        console.error('Delete failed:', error);
        showInfo('Failed to delete property.');
      }
    });
  };

  const handleDuplicate = () => {
    showConfirm('Are you sure you want to duplicate this property?', async () => {
      try {
        await axios.post(
          `/properties/${propertyId}/duplicate`,
          {},
          { headers: getAuthHeaders() }
        );
        showInfo('Property duplicated successfully.', () => router.push('/admin/dashboard'));
      } catch (error) {
        console.error('Duplicate failed:', error);
        showInfo('Failed to duplicate property.');
      }
    });
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        {!hideEdit && (
          <button
            onClick={() => router.push(`/admin/edit-property/${propertyId}`)}
            className="p-2 rounded hover:bg-blue-100 text-blue-600"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
            </svg>
          </button>
        )}

        <button
          onClick={handleDelete}
          className="p-2 rounded hover:bg-red-100 text-red-600"
          title="Delete"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a2 2 0 002 2v0a2 2 0 01-2 2m4-4a2 2 0 012 2v0a2 2 0 01-2 2" />
          </svg>
        </button>

        <button
          onClick={handleDuplicate}
          className="p-2 rounded hover:bg-green-100 text-green-600"
          title="Duplicate"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16h8M8 12h8M8 8h8M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        <a
          href={`/properties/${propertyId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded hover:bg-gray-100 text-gray-600"
          title="View"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </a>
      </div>


      {/* Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-lg text-center">
            <p className="mb-6 text-gray-800">{modal.message}</p>

            {modal.type === 'confirm' ? (
              <div className="flex justify-center gap-4">
                <button
                  onClick={modal.onConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Yes
                </button>
                <button
                  onClick={modal.onCancel}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (modal.onConfirm) {
                    modal.onConfirm();
                  } else {
                    closeModal();
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ActionIcons;
