// pages/admin/admin-profile.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminSidebar from '../../components/AdminSidebar';
import axios from '../../utils/axiosInstance';

export default function AdminProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.dispatchEvent(new Event('logout'));
    router.push('/admin/login');
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const res = await axios.get('/admin/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err) {
      setError('Failed to load profile. Please try again.');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center">{error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Admin Profile</h1>
          {profile && (
            <div className="flex flex-col items-center space-y-4">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-24 h-24 rounded-full border-2 border-gray-300" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">N/A</div>
              )}
              <div className="w-full max-w-md bg-gray-50 p-6 rounded shadow space-y-3">
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Phone:</strong> {profile.phone || 'N/A'}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

