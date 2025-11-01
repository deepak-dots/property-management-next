// pages/admin/cms-pages/pages.js
import { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import Link from 'next/link';
import AdminSidebar from '../../../components/AdminSidebar';
import { useRouter } from 'next/router';

export default function CmsPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, action: null, page: null });
  const router = useRouter();

  useEffect(() => {
    async function fetchPages() {
      try {
        const res = await axios.get('/pages');
        setPages(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    fetchPages();
  }, []);

  const handleConfirm = async () => {
    if (!modal.page) return;
    try {
      if (modal.action === 'delete') {
        await axios.delete(`/pages/${modal.page._id}`);
        setPages((prev) => prev.filter((p) => p._id !== modal.page._id));
      } else if (modal.action === 'duplicate') {
        const duplicatePage = {
          title: modal.page.title + ' Copy',
          slug: modal.page.slug + '-copy',
          content: modal.page.content,
        };
        const res = await axios.post('/pages', duplicatePage);
        setPages((prev) => [...prev, res.data]);
      }
      setModal({ show: false, action: null, page: null });
    } catch (err) {
      console.error(err);
      alert('Action failed');
      setModal({ show: false, action: null, page: null });
    }
  };

  if (loading) return <p className="p-6">Loading pages...</p>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <main className="flex-1 bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-4">Pages</h1>
        <Link href="/admin/cms-pages/add-page">
          <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4">
            Add New Page
          </button>
        </Link>

        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-center">Title</th>
              <th className="border px-4 py-2 text-center">Slug</th>
              <th className="border px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  No pages found.
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page._id}>
                  <td className="border px-4 py-2 text-center">{page.title}</td>
                  <td className="border px-4 py-2 text-center">{page.slug}</td>
                  <td className="border px-4 py-2 text-center space-x-2">
                    {/* Edit button */}
                    <Link href={`/admin/cms-pages/${page._id}`}>
                      <button className="bg-yellow-500 text-white px-2 py-1 rounded">
                        Edit
                      </button>
                    </Link>

                    {/* View button */}
                    <button
                      onClick={() => router.push(`/page/${page.slug}`)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      View
                    </button>

                    {/* Duplicate button */}
                    <button
                      onClick={() => setModal({ show: true, action: 'duplicate', page })}
                      className="bg-indigo-500 text-white px-2 py-1 rounded"
                    >
                      Duplicate
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => setModal({ show: true, action: 'delete', page })}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Confirmation Modal */}
        {modal.show && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded p-6 w-96">
              <h2 className="text-xl font-bold mb-4">
                {modal.action === 'delete' ? 'Delete Page' : 'Duplicate Page'}
              </h2>
              <p className="mb-6">
                Are you sure you want to {modal.action} "{modal.page.title}"?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setModal({ show: false, action: null, page: null })}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
