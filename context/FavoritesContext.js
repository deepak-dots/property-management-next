'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const FavoritesContext = createContext();
const GUEST_FAVORITES_KEY = 'guestFavorites';

export const FavoritesProvider = ({ children }) => {
  const { token: authToken } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => authToken || localStorage.getItem('userToken');

  // Fetch favorites initially
  useEffect(() => {
    const fetchFavorites = async () => {
      const jwtToken = getToken();

      if (!jwtToken) {
        const guest = JSON.parse(localStorage.getItem(GUEST_FAVORITES_KEY) || '[]');
        setFavorites(guest);
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get('/user/favorites', {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        setFavorites(res.data);
      } catch (err) {
        console.error('Error fetching favorites:', err.response?.data || err.message);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [authToken]);

  // ---------- NEW: Refresh favorites on login ----------
  useEffect(() => {
    const handleLogin = () => {
      refreshFavorites();
    };
    window.addEventListener('login', handleLogin);
    return () => window.removeEventListener('login', handleLogin);
  }, []);

  // Refresh favorites function
  const refreshFavorites = async () => {
    const jwtToken = getToken();
    if (!jwtToken) return;

    try {
      const res = await axiosInstance.get('/user/favorites', {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      setFavorites(res.data);
    } catch (err) {
      console.error('Failed to refresh favorites:', err.response?.data || err.message);
    }
  };

  const toggleFavorite = async (propertyOrId) => {
    const jwtToken = getToken();

    let propertyId = null;
    let propertyObj = null;

    if (typeof propertyOrId === 'string') {
      propertyId = propertyOrId;
    } else if (propertyOrId && propertyOrId._id) {
      propertyObj = propertyOrId;
      propertyId = propertyObj._id;
    } else {
      console.error('toggleFavorite: invalid argument', propertyOrId);
      throw new Error('Invalid property');
    }

    // -------- Guest user ----------
    if (!jwtToken) {
      const stored = JSON.parse(localStorage.getItem(GUEST_FAVORITES_KEY) || '[]');
      const index = stored.findIndex((f) => f._id === propertyId);

      let newStored;
      let added = false;

      if (index > -1) {
        newStored = stored.filter((f) => f._id !== propertyId);
        toast.success(`${propertyObj?.title || 'Property'} removed from wishlist`);
      } else {
        const toStore = propertyObj ? propertyObj : { _id: propertyId };
        newStored = [...stored, toStore];
        toast.success(`${propertyObj?.title || 'Property'} added to wishlist`);
        toast.info('Login to save this property permanently');
        added = true;
      }

      localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(newStored));
      setFavorites(newStored);

      return added;
    }

    // -------- Logged-in user ----------
    try {
      const alreadyFavorited = favorites.some((f) => f._id === propertyId);

      const res = await axiosInstance.post(
        '/user/favorites',
        { propertyId },
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );

      setFavorites(res.data);

      if (alreadyFavorited) {
        toast.success(`${propertyObj?.title || 'Property'} removed from wishlist`);
        return false;
      } else {
        toast.success(`${propertyObj?.title || 'Property'} added to wishlist`);
        return true;
      }
    } catch (err) {
      console.error('Error toggling favorite:', err.response?.data || err.message);
      toast.error('Failed to update favorite');
      throw err;
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, loading, refreshFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
