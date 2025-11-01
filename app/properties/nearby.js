// pages/nearest-properties.jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../../utils/axiosInstance';
import PropertyCard from '../../components/PropertyCard';
import CompareModal from '../../components/CompareModal';

const NearestPropertiesPage = () => {
  const router = useRouter();
  const { lat, lng } = router.query;

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State to control Compare modal
  const [showCompareModal, setShowCompareModal] = useState(false);

  const fetchNearbyProperties = async (lat, lng) => {
    if (!lat || !lng) return;

    setLoading(true);
    try {
      const res = await axiosInstance.post('/properties/nearby', { lat, lng });
      setProperties(res.data.properties || []);
      setError(null);
    } catch (err) {
      console.error("Fetch nearby error:", err);
      setError("Failed to fetch nearest properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lat && lng) {
      fetchNearbyProperties(lat, lng);
    }
  }, [lat, lng]);

  const openCompareModal = () => setShowCompareModal(true);
  const closeCompareModal = () => setShowCompareModal(false);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Nearby Properties</h2>

      {loading && <p>Loading nearest properties...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && properties.length === 0 && <p>No nearby properties found.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {properties.map((property) => (
          <PropertyCard
            key={property._id}
            property={property}
            onOpenCompare={openCompareModal} // ✅ Pass modal open function
          />
        ))}
      </div>

      {/* Global Compare Modal */}
      <CompareModal
        isOpen={showCompareModal}
        onClose={closeCompareModal}
      />
    </div>
  );
};

export default NearestPropertiesPage;
