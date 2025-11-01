'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './UserSidebar';
import axios from '../utils/axiosInstance';
import UserDashboardSkeleton from '../skeleton/UserDashboardSkeleton';

export default function UserLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) return router.push('/user/login');

    const fetchUser = async () => {
      try {
        const res = await axios.get('/user/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem('userToken');
        router.push('/user/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) return <UserDashboardSkeleton />; // show skeleton

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
