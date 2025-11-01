'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import axios from '../../utils/axiosInstance';
import UserLayout from '../../components/UserLayout';

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) return router.push('/user/login');

    const fetchProfile = async () => {
      try {
        const res = await axios.get('/user/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch {
        localStorage.removeItem('userToken');
        router.push('/user/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  return (
    <UserLayout user={user}>
      <div className="max-w-2xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">My Profile</h1>
    
        <div className="bg-white p-6 sm:p-8 space-y-6">
          {/* Name */}
          <div className="flex flex-col sm:flex-row justify-between border-b border-gray-200 pb-3">
            <span className="font-medium text-gray-700 mb-1 sm:mb-0">Name:</span>
            <span className="text-gray-900">{user?.name}</span>
          </div>
    
          {/* Email */}
          <div className="flex flex-col sm:flex-row justify-between border-b border-gray-200 pb-3">
            <span className="font-medium text-gray-700 mb-1 sm:mb-0">Email:</span>
            <span className="text-gray-900">{user?.email}</span>
          </div>
    
          {/* Phone */}
          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-medium text-gray-700 mb-1 sm:mb-0">Phone:</span>
            <span className="text-gray-900">{user?.phone || 'Not added'}</span>
          </div>
    
          {/* Edit Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/user/profile/edit')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition w-full sm:w-auto"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  
  );
}
