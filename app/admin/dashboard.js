import { useEffect, useState, useRef } from 'react';
import axios from '../../utils/axiosInstance';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminSearchBar from '../../components/AdminSearchBar';
import AdminSidebar from '../../components/AdminSidebar';
const API_URL = process.env.NEXT_PUBLIC_API_URL;



function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isNotification = false, // new flag to show simple message modal
  onCloseNotification,    // callback to close notification modal
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded p-6 max-w-sm w-full shadow-lg">
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        <p className="mb-6">{message}</p>

        {isNotification ? (
          <div className="flex justify-end">
            <button
              onClick={onCloseNotification}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimeout = useRef(null);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState([]);


  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;

  // Modal state for confirmation
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'delete' or 'duplicate'
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  // Modal state for notification messages
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');

  // Fetch properties with optional search param, pagination
  const fetchProperties = async (search = '', page = 1, limit = 9) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const res = await axios.get('/properties', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          search,
          page,
          limit,
        },
      });

      if (Array.isArray(res.data.properties)) {
        setProperties(res.data.properties);
      } else if (Array.isArray(res.data)) {
        setProperties(res.data);
      } else {
        setProperties([]);
      }

      // Set total pages or calculate it from totalCount
      if (res.data.totalPages) {
        setTotalPages(res.data.totalPages);
      } else if (res.data.totalCount) {
        setTotalPages(Math.ceil(res.data.totalCount / limit));
      } else {
        setTotalPages(1); // fallback
      }
    } catch (err) {
      openNotification('Error', 'Failed to fetch properties');
      console.error(err);
      setProperties([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (search) => {
    setSearchQuery(search);
    setCurrentPage(1);
    fetchProperties(search, 1, itemsPerPage);
  };

  const handleSearchChange = (search) => {
    setSearchQuery(search);
    setCurrentPage(1);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchProperties(search, 1, itemsPerPage);
    }, 500);
  };

  useEffect(() => {
    fetchProperties(searchQuery, currentPage, itemsPerPage);
  }, [searchQuery, currentPage]);

  const openModal = (action, propertyId) => {
    setModalAction(action);
    setSelectedPropertyId(propertyId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAction(null);
    setSelectedPropertyId(null);
  };

  const openNotification = (title, message) => {
    setNotificationTitle(title);
    setNotificationMessage(message);
    setNotificationOpen(true);
  };

  const closeNotification = () => {
    setNotificationOpen(false);
    setNotificationTitle('');
    setNotificationMessage('');
  };

  const confirmModalAction = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
  
    try {
      if (modalAction === 'delete') {
        await axios.delete(`/properties/${selectedPropertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        openNotification('Success', 'Property deleted successfully!');
      } else if (modalAction === 'duplicate') {
        await axios.post(
          `/properties/${selectedPropertyId}/duplicate`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        openNotification('Success', 'Property duplicated successfully!');
      } else if (modalAction === 'bulkDelete') {
        await Promise.all(selectedPropertyIds.map(id =>
          axios.delete(`/properties/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ));
        openNotification('Success', 'Selected properties deleted successfully!');
        setSelectedPropertyIds([]);
      }
  
      fetchProperties(searchQuery, currentPage, itemsPerPage);
    } catch (err) {
      openNotification('Error', 'Failed to perform the action');
      console.error(err);
    } finally {
      closeModal();
    }
  };
  

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.dispatchEvent(new Event('logout')); 
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-xl">
        Loading properties...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col md:flex-row">

      {/* Sidebar */}
      <div className="md:w-64 w-full bg-white shadow-md">
        <AdminSidebar onLogout={handleLogout} />
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-4 md:p-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>

            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="/properties" target="_blank">
                <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
                  View All Properties
                </button>
              </Link>
            </div>
          </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
            <div className="">
              
              <Link href="/admin/add-property">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Add New Property
                </button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                Logout
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="mb-4">
            <AdminSearchBar
              initialSearch={searchQuery}
              onSearch={handleSearch}
              onSearchChange={handleSearchChange}
            />
          </div>

          {/* Table */}
          {selectedPropertyIds.length > 0 && (
            <button
              onClick={() => openModal('bulkDelete')}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mb-4"
            >
              Delete Selected ({selectedPropertyIds.length})
            </button>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-100">
                <th className="px-2 py-2 border">
                    <input
                      type="checkbox"
                      checked={selectedPropertyIds.length === properties.length && properties.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPropertyIds(properties.map(p => p._id));
                        } else {
                          setSelectedPropertyIds([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-2 py-2 border text-left">Image</th>
                  <th className="px-2 py-2 border text-left">Property Name</th>
                  <th className="px-2 py-2 border text-left">Property Type</th>
                  <th className="px-2 py-2 border text-left">Furnishing (BHK Type)</th>
                  <th className="px-2 py-2 border text-left">Price</th>
                  <th className="px-2 py-2 border text-left">City</th>
                  <th className="px-2 py-2 border text-left">Status</th>
                  <th className="px-2 py-2 border text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p, index) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-2 py-1 border text-center">
                      <input
                        type="checkbox"
                        checked={selectedPropertyIds.includes(p._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPropertyIds(prev => [...prev, p._id]);
                          } else {
                            setSelectedPropertyIds(prev => prev.filter(id => id !== p._id));
                          }
                        }}
                      />
                    </td>

                    <td className="px-2 py-1 border">
                      {p.images && p.images.length > 0 ? (
                        <img
                          src={p.images[0].startsWith("http") ? p.images[0] : `${API_URL}/uploads/${p.images[0]}`}
                          alt={p.title}
                          className="h-12 w-16 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </td>

                    <td className="px-2 py-1 border">
                      <Link href={`/admin/edit-property/${p._id}`} className="block hover:bg-gray-100 px-1 py-1">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-2 py-1 border">{p.propertyType || '-'}</td>
                    <td className="px-2 py-1 border">{p.furnishing || '-'} ({p.bhkType || '-'})</td>
                    <td className="px-2 py-1 border">{p.price ? `₹${p.price}` : '-'}</td>
                    <td className="px-2 py-1 border">{p.city || '-'}</td>
                    <td className="px-2 py-1 border">{p.status || '-'}</td>
                    
                    <td className="px-2 py-1 border">
                        <div className="flex gap-2">
                          {/* Edit */}
                          <Link href={`/admin/edit-property/${p._id}`} className="flex items-center justify-center w-8 h-8 rounded hover:bg-blue-100 text-blue-600" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                            </svg>
                          </Link>

                          {/* Delete */}
                          <button onClick={() => openModal('delete', p._id)} className="flex items-center justify-center w-8 h-8 rounded hover:bg-red-100 text-red-600" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a2 2 0 002 2v0a2 2 0 01-2 2m4-4a2 2 0 012 2v0a2 2 0 01-2 2" />
                            </svg>
                          </button>

                          {/* Duplicate */}
                          <button onClick={() => openModal('duplicate', p._id)} className="flex items-center justify-center w-8 h-8 rounded hover:bg-green-100 text-green-600" title="Duplicate">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16h8M8 12h8M8 8h8M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>

                          {/* View */}
                          <Link href={`/properties/${p._id}`} target="_blank" className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-600" title="View">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        </div>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-4">
            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 rounded border disabled:opacity-50">
              Previous
            </button>
            <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 rounded border disabled:opacity-50">
              Next
            </button>
          </div>

          {/* Modals */}
          <ConfirmationModal isOpen={modalOpen} title={modalAction === 'delete' ? 'Delete Property' : 'Duplicate Property'} message={modalAction === 'delete' ? 'Are you sure you want to delete this property?' : 'Do you want to duplicate this property?'} onConfirm={confirmModalAction} onCancel={closeModal} confirmText="Yes" cancelText="Cancel" />

          <ConfirmationModal isOpen={notificationOpen} isNotification={true} title={notificationTitle} message={notificationMessage} onCloseNotification={closeNotification} />

          <ConfirmationModal
            isOpen={modalOpen}
            title={modalAction === 'delete' ? 'Delete Property' : modalAction === 'duplicate' ? 'Duplicate Property' : 'Delete Selected Properties'}
            message={modalAction === 'delete' ? 'Are you sure you want to delete this property?' : modalAction === 'duplicate' ? 'Do you want to duplicate this property?' : `Are you sure you want to delete ${selectedPropertyIds.length} selected properties?`}
            onConfirm={confirmModalAction}
            onCancel={closeModal}
            confirmText="Yes"
            cancelText="Cancel"
          />
    

        </div>
      </main>
    </div>

  );
}
