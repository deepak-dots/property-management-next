import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PropertyForm from '../../components/PropertyForm';
import AdminSidebar from '../../components/AdminSidebar';

export default function AddPropertyPage() {
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;

    const token = localStorage.getItem('adminToken');

    if (!token) {
      router.replace('/admin/login');
    } else {
      setIsAuthorized(true);
    }

    setCheckingAuth(false);
  }, [router.isReady, router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-xl">
        Checking authorization...
      </div>
    );
  }

  if (!isAuthorized) return null;

  const handleSuccess = () => {
    router.push('/admin/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.dispatchEvent(new Event('logout'));
    router.push('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <AdminSidebar onLogout={handleLogout} />

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Add New Property</h1>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="w-full">
            <PropertyForm propertyId={null} onSuccess={handleSuccess} />
          </div>
        </div>
      </main>
    </div>
  );
}
