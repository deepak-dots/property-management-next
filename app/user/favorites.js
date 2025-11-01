// user/favorites.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import UserLayout from '../../components/UserLayout';
import PropertyCard from '../../components/PropertyCard';
import { useFavorites } from '../../context/FavoritesContext';

export default function MyFavorites() {
  const router = useRouter();
  const { favorites, loading, refreshFavorites } = useFavorites(); // added refreshFavorites
  const [favoriteList, setFavoriteList] = useState([]);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      router.push('/user/login');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  // Update favorite list when favorites or loading changes
  useEffect(() => {
    if (!loading) {
      setFavoriteList(favorites || []);
    }
  }, [favorites, loading]);

  // Listen for login events to refresh favorites immediately
  useEffect(() => {
    const handleLogin = () => {
      refreshFavorites();
    };
    window.addEventListener('login', handleLogin);
    return () => window.removeEventListener('login', handleLogin);
  }, [refreshFavorites]);

  if (checkingAuth) {
    return <p className="p-8">Checking authentication...</p>;
  }

  return (
    <UserLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">My Favorites</h1>

        {loading ? (
          <p>Loading favorites...</p>
        ) : favoriteList.length === 0 ? (
          <p>You have no favorite properties yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteList.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onOpenCompare={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
