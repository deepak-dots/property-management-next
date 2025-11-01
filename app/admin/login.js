import React from 'react';
import { useForm } from 'react-hook-form';
import axios from '../../utils/axiosInstance';
import { useRouter } from 'next/router';

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      // Make API call
      const res = await axios.post('/admin/login', data);

      // Check if token exists before setting
      if (res.data && res.data.token) {
        localStorage.setItem('adminToken', res.data.token);

        // Optional: wait a tick before redirecting to ensure localStorage is set
        setTimeout(() => {
          window.dispatchEvent(new Event('login'));
          router.push('/admin/dashboard');
        }, 100);
      } else {
        setError('apiError', { message: 'Login failed: no token received' });
      }
    } catch (err) {
      setError('apiError', { message: err.response?.data?.message || 'Login failed' });
    }
  };

  return (
    <div
        className="min-h-screen flex items-center justify-center bg-gray-100 px-4 bg-cover bg-center"
        style={{ backgroundImage: "url('../../../images/property1.jpg')", minHeight: "calc(100vh - 423px)" }}
      >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm space-y-4"
        noValidate
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Admin Login</h2>

        {/* Email Field */}
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
            })}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-6">
          <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.password
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* API Error */}
        {errors.apiError && (
          <p className="text-red-600 text-sm mb-4">{errors.apiError.message}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded-md text-white font-semibold ${
            isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } transition`}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        {/* Message below form */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/admin/signup" className="text-blue-600 hover:underline">
            Please Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
