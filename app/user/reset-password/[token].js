'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import axios from '../../../utils/axiosInstance';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query; // get token from URL
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const res = await axios.post('/user/reset-password', { token, password: data.password });
      setMessage(res.data.message);
      setSuccess(true); // Hide form, show login link
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error resetting password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">Reset Password</h2>

        {!success ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium mb-1">New Password</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: 'Password is required' })}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', { required: 'Confirm Password is required' })}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-500"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-green-600 font-medium mb-4">{message}</p>
            <a
              href="/user/login"
              className="inline-block py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </a>
          </div>
        )}

        {!success && message && <p className="text-center text-sm mt-2 text-red-600">{message}</p>}
      </div>
    </div>
  );
}
