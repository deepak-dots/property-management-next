// user/EditProfile.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../../../utils/axiosInstance';
import UserLayout from '../../../components/UserLayout';

export default function EditProfile() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) return router.push('/user/login');

    const fetchProfile = async () => {
      try {
        const res = await axios.get('/user/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm({
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } catch {
        localStorage.removeItem('userToken');
        router.push('/user/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError({ ...error, [e.target.name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^[0-9]{10}$/;

    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (form.phone && !phoneRegex.test(form.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Password validation (optional)
    if (form.newPassword || form.confirmPassword) {
      if (!form.currentPassword) newErrors.currentPassword = 'Current password is required to change password';
      if (form.newPassword.length < 6) newErrors.newPassword = 'New password must be at least 6 characters';
      if (form.newPassword !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitConfirmed = async () => {
    const token = localStorage.getItem('userToken');

    try {
      const dataToSend = {
        name: form.name,
        email: form.email,
        phone: form.phone,
      };
      
      if (form.newPassword) {
        dataToSend.currentPassword = form.currentPassword; 
        dataToSend.password = form.newPassword; 
      }

      const res = await axios.put('/user/dashboard', dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(res.data.message || 'Profile updated successfully!');
      setShowModal(false);
      setForm({ ...form, currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Error updating profile');
      setShowModal(false);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) setShowModal(true);
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto mt-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Edit Profile</h1>

        {message && (
          <div className="bg-green-100 text-green-700 px-4 py-3  mb-6 text-center">
            {message}
          </div>
        )}

        <div className="bg-white  p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Info Section */}
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Profile Information</h2>

            {/* Name */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your name"
                required
              />
              {error.name && <p className="text-red-500 text-sm mt-1">{error.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
                required
              />
              {error.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your phone number"
              />
              {error.phone && <p className="text-red-500 text-sm mt-1">{error.phone}</p>}
            </div>

            {/* Password Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Change Password (Optional)</h2>

              {/* Current Password */}
              <div className="mb-4">
                <label className="block font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter current password"
                />
                {error.currentPassword && <p className="text-red-500 text-sm mt-1">{error.currentPassword}</p>}
              </div>

              {/* New Password */}
              <div className="mb-4">
                <label className="block font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter new password"
                />
                {error.newPassword && <p className="text-red-500 text-sm mt-1">{error.newPassword}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Confirm new password"
                />
                {error.confirmPassword && <p className="text-red-500 text-sm mt-1">{error.confirmPassword}</p>}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => router.push('/user/profile')}
                className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Confirm Save</h2>
              <p className="mb-6">Are you sure you want to save these changes?</p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                  onClick={() => setShowModal(false)}
                >
                  No
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  onClick={handleSubmitConfirmed}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>

  );
}
