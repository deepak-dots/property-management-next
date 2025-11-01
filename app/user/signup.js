import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from '../../utils/axiosInstance';
import { useRouter } from 'next/router';

export default function SignupForm() {
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    try {
      const res = await axios.post('/user/signup', data, {
        headers: { 'Content-Type': 'application/json' },
      });
      setSuccess(res.data.message || 'Signup successful');
      reset();

      setTimeout(() => {
        router.push('/user/login');
      }, 500);
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg) setError(serverMsg);
      else if (err.request) setError('No response from server (check backend or CORS)');
      else setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">User Signup</h2>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <div className="mb-4">
          <label htmlFor="fullname" className="block mb-1 text-sm font-medium text-gray-700">
            Full Name
          </label>

        <input
          {...register('name', { required: 'Name is required' })}
          placeholder="Full Name"
          className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
            errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
          Email
          </label>

        <input
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
          })}
          placeholder="Email"
          className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
            errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>

      <div className="mb-4">
        <label htmlFor="Password" className="block mb-1 text-sm font-medium text-gray-700">
          Password
        </label>

        <input
          type="password"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          })}
          placeholder="Password"
          className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
            errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}

        </div>

        <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 rounded-md text-white font-semibold ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } transition`}
          >
            {isSubmitting ? 'Signing up...' : 'Sign Up'}
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/user/login" className="text-blue-600 hover:underline">
              Please Login
            </a>
          </p>
        
      </form>
    </div>
  );
}
