import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import PropertyCard from '../components/PropertyCard';

const NearbyProperties = () => {
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fallbackLat = 26.8594;
  const fallbackLng = 75.8328;

  const fetchNearbyProperties = async (lat, lng) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/properties/nearby', { lat, lng });
      setProperties(res.data.properties);
      setError(null);
    } catch (err) {
      console.error('Fetch nearby error:', err);
      setError('Failed to fetch nearby properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      // If geolocation not supported, use fallback
      setCoords({ lat: fallbackLat, lng: fallbackLng });
      fetchNearbyProperties(fallbackLat, fallbackLng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        fetchNearbyProperties(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        // If user denies access, use fallback
        setCoords({ lat: fallbackLat, lng: fallbackLng });
        fetchNearbyProperties(fallbackLat, fallbackLng);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      

      {coords.lat && coords.lng && (
        <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Nearby Properties</h2>
            {/* <p>
            📍 Showing properties near: <br />
            Latitude: {coords.lat} <br />
            Longitude: {coords.lng}
            </p> */}
        </div>
        )}


      {loading && <p>Loading nearby properties...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {/* {!loading && properties.length === 0 && <p>No nearby properties found.</p>} */}

      {properties.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyProperties;
