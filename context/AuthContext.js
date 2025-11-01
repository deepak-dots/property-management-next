'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('userToken');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/user/login', { email, password });

    if (res.data?.token) {
      const token = res.data.token;
      setToken(token);
      setUser(res.data.user);
      localStorage.setItem('userToken', token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Sync guest favorites
      try {
        const guestFavorites = JSON.parse(localStorage.getItem('guestFavorites') || '[]');
        if (guestFavorites.length > 0) {
          const serverFavRes = await axios.get('/user/favorites', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const serverIds = serverFavRes.data.map(f => f._id);

          for (const fav of guestFavorites) {
            const id = fav._id || fav;
            if (!serverIds.includes(id)) {
              await axios.post(
                '/user/favorites',
                { propertyId: id },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            }
          }

          localStorage.removeItem('guestFavorites');
        }
      } catch (err) {
        console.error('Failed to sync guest favorites:', err.response?.data || err.message);
      }

      // Trigger login event
      window.dispatchEvent(new Event('login'));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
  };

  const loginWithOTP = async (email, otp, setError) => {
    try {
      const res = await axios.post('/user/login/verify-otp', { email, otp });
  
      if (res.data?.token) {
        const token = res.data.token;
        setToken(token);
        setUser(res.data.user);
        localStorage.setItem('userToken', token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
  
        // Sync guest favorites (same as password login)
        try {
          const guestFavorites = JSON.parse(localStorage.getItem('guestFavorites') || '[]');
          if (guestFavorites.length > 0) {
            const serverFavRes = await axios.get('/user/favorites', {
              headers: { Authorization: `Bearer ${token}` },
            });
            const serverIds = serverFavRes.data.map(f => f._id);
  
            for (const fav of guestFavorites) {
              const id = fav._id || fav;
              if (!serverIds.includes(id)) {
                await axios.post(
                  '/user/favorites',
                  { propertyId: id },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              }
            }
            localStorage.removeItem('guestFavorites');
          }
        } catch (err) {
          console.error('Failed to sync guest favorites:', err.response?.data || err.message);
        }
  
        window.dispatchEvent(new Event('login'));
      }
    } catch (err) {
      console.error('OTP login error:', err.response?.data || err.message);
      if (setError) {
        setError('apiError', {
          message: err.response?.data?.message || 'OTP login failed',
        });
      }
      throw err;
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithOTP, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};



export const useAuth = () => useContext(AuthContext);
