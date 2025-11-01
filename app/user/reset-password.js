'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import axios from '../../utils/axiosInstance';
import { useState, useEffect } from 'react';

export default function ResetPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [message, setMessage] = useState('');

  // Get token from URL (?token=xxx)
  useEffect(() => {
    if (router.query.token) {
      setToken(router.query.token);
    }
  }, [router.query.token]);

  const onSubmit = async (data) => {
    try {
      const res = await axios.post('/user/reset-password', { token, password: data.password });
      setMessage(res.data.message);
      setTimeout(() => router.push('/user/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error resetting password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">Reset Password</h2>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">New Password</label>
          <input
            id="password"
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Min length 6 characters' },
            })}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter new password"
          />
          {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </button>

        {message && <p className="text-center text-sm mt-4 text-green-600">{message}</p>}
      </form>
    </div>
  );
}
