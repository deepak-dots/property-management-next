'use client';

import { useForm } from 'react-hook-form';
import axios from '../../utils/axiosInstance';
import { useState } from 'react';

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [message, setMessage] = useState('');

  const onSubmit = async (data) => {
    try {
      const res = await axios.post('/user/forgot-password', data);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending reset link');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
    <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Forgot Password</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Input */}
        <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
            id="email"
            type="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        </div>

        {/* Submit Button */}
        <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
        </form>

        {/* Message */}
        {message && <p className="text-center text-sm mt-4 text-green-600">{message}</p>}
    </div>
    </div>

  );
}
