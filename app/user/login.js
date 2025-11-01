'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axiosInstance';

export default function LoginForm() {
  const router = useRouter();
  const { login, loginWithOTP } = useAuth(); //
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  const [useOtp, setUseOtp] = useState(false);   
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

const onSubmit = async (data) => {
  try {
    if (!useOtp) {
      console.log('Password login:', data);
      await login(data.email, data.password); // AuthContext login handles token
      router.push('/user/dashboard');
    } else {
      console.log('OTP login, otpSent:', otpSent);
      if (!otpSent) {
        console.log('Sending OTP to:', data.email);
        try {
          await axios.post('/user/login/send-otp', { email: data.email });
          setOtpSent(true);
        } catch (err) {
          console.error('Error sending OTP:', err.response?.data || err.message);
          setError('apiError', {
            message: err.response?.data?.message || 'Failed to send OTP',
          });
        }
      } else {
        console.log('Verifying OTP:', otp);

        try {
          // ✅ Use AuthContext loginWithOTP for proper state & token handling
          await loginWithOTP(data.email, otp, setError);

          router.push('/user/dashboard'); // redirect to dashboard
        } catch (err) {
          console.error('OTP verification error:', err.response?.data || err.message);
          setError('apiError', {
            message: err.response?.data?.message || 'OTP verification failed',
          });
        }
      }
    }
  } catch (err) {
    console.error('Login error:', err.response?.data || err);
    setError('apiError', {
      message: err.response?.data?.message || 'Login failed',
    });
  }
};

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8 py-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm space-y-4"
        noValidate
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          {useOtp ? 'Login via OTP' : 'User Login'}
        </h2>

        {/* Email */}
        <div>
          <label>Email</label>
          <input
            type="email"
            {...register('email', {
              required: 'Email required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
            })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>

        {/* Password (only for password login mode) */}
        {!useOtp && (
          <div>
            <label>Password</label>
            <input
              type="password"
              {...register('password', {
                required: 'Password required',
                minLength: { value: 6, message: 'Min 6 characters' },
              })}
              className="w-full border rounded px-3 py-2"
            />
            {errors.password && <p className="text-red-500">{errors.password.message}</p>}
          </div>
        )}

        {/* OTP input */}
        {useOtp && otpSent && (
          <div>
            <label>Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        )}

        {/* API Error */}
        {errors.apiError && <p className="text-red-500">{errors.apiError.message}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded text-white ${
            isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {useOtp ? (otpSent ? 'Verify OTP' : 'Send OTP') : isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        {/* Links */}
        <p className="text-sm text-center text-gray-600 mt-2">
          Forgot your password?{' '}
          <a href="/user/forgot-password" className="text-blue-600 hover:underline">
            Reset here
          </a>
        </p>

        <p className="text-sm text-center text-gray-600 mt-2">
          Don't have an account?{' '}
          <a href="/user/signup" className="text-blue-600 hover:underline">
            Sign Up
          </a>
        </p>

        {/* Toggle login mode */}
        <p
          className="text-sm text-center text-blue-600 hover:underline mt-2 cursor-pointer"
          onClick={() => {
            setUseOtp(!useOtp);
            setOtpSent(false);
            setOtp('');
          }}
        >
          {useOtp ? 'Login with Password' : 'Login with Email OTP'}
        </p>
      </form>
    </div>
  );
}
