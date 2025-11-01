import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from '../../utils/axiosInstance';
import PropertyCard from '../../components/PropertyCard';
import PropertyFilters from '../../components/PropertyFilter'; // updated import
import CompareModal from '../../components/CompareModal';
import PropertyCardSkeleton from '../../skeleton/PropertyCardSkeleton';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    priceMin: null,
    priceMax: null,
    city: '',
    bhkType: '',
    propertyType: '',
    furnishing: '',
    transactionType: '',
    status: '',
    radius: null, 
    lat: null, 
    lng: null, 
  });

  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    propertyTypes: [],
    bhkTypes: [],
    furnishings: [],
    transactionTypes: [],
    statuses: [],
    priceMin: 0,
    priceMax: 1000000,
  });

  const [showCompareModal, setShowCompareModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;

  const router = useRouter();

  // Get user location
  useEffect(() => {
    if (!filters.lat || !filters.lng) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFilters(prev => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }));
        },
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, []);

  // Fetch properties whenever filters or page change
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const params = { ...filters, page: currentPage, limit: itemsPerPage };

        // Remove null/empty values
        Object.keys(params).forEach(key => {
          if (params[key] === null || params[key] === '') delete params[key];
        });

        const res = await axios.get('/properties', { params });
        const propertyList = res.data.properties || [];
        setProperties(propertyList);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error(err);
        setProperties([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    if (filters.lat && filters.lng) fetchProperties();
  }, [filters, currentPage]);

  // Fetch ALL properties once to generate filter options
  useEffect(() => {
    const fetchAllProperties = async () => {
      try {
        const res = await axios.get('/properties');
        const allProperties = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.properties)
          ? res.data.properties
          : [];

        const prices = allProperties.map((p) => p.price).filter(Boolean);
        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : 1000000;

        setFilterOptions({
          cities: [...new Set(allProperties.map((p) => p.city).filter(Boolean))].sort(),
          propertyTypes: [...new Set(allProperties.map((p) => p.propertyType).filter(Boolean))].sort(),
          bhkTypes: [...new Set(allProperties.map((p) => p.bhkType).filter(Boolean))].sort(),
          furnishings: [...new Set(allProperties.map((p) => p.furnishing).filter(Boolean))].sort(),
          transactionTypes: [...new Set(allProperties.map((p) => p.transactionType).filter(Boolean))].sort(),
          statuses: [...new Set(allProperties.map((p) => p.status).filter(Boolean))].sort(),
          priceMin: minPrice,
          priceMax: maxPrice,
        });

        setFilters((prev) => ({
          ...prev,
          priceMin: prev.priceMin ?? minPrice,
          priceMax: prev.priceMax ?? maxPrice,
        }));
      } catch (error) {
        console.error('Failed to fetch all properties for filter options', error);
      }
    };

    fetchAllProperties();
  }, []);

  const handleFilterChange = (eOrObj) => {
    let newFilters = { ...filters };
  
    if (eOrObj.target) {
      const { name, value } = eOrObj.target;
  
      // If the user selects "All", set filter to null
      newFilters[name] = value === "" || value === "All" ? null : value;
    } else {
      newFilters = { ...newFilters, ...eOrObj };
    }
  
    // Convert numbers
    if (newFilters.priceMin != null) newFilters.priceMin = Number(newFilters.priceMin);
    if (newFilters.priceMax != null) newFilters.priceMax = Number(newFilters.priceMax);
    if (newFilters.radius != null) newFilters.radius = Number(newFilters.radius);
  
    setFilters(newFilters);
    setCurrentPage(1);
  
    // Prepare URL params
    const params = { ...newFilters };
  
    // Only include radius & coordinates if radius is set
    if (!params.radius) {
      delete params.radius;
      delete params.lat;
      delete params.lng;
    }
  
    const queryString = new URLSearchParams(params).toString();
    router.push(`/properties?${queryString}`, undefined, { shallow: true });
  };
  
  

  const clearFilters = () => {
    setFilters({
      search: '',
      priceMin: filterOptions.priceMin,
      priceMax: filterOptions.priceMax,
      city: '',
      bhkType: '',
      furnishing: '',
      transactionType: '',
      status: '',
      radius: null,
      lat: filters.lat,
      lng: filters.lng,
    });
    setCurrentPage(1);
    router.push('/properties', undefined, { shallow: true });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Properties</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <PropertyFilters
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />

          <div className="md:w-3/4 w-full h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: itemsPerPage }).map((_, idx) => (
                <PropertyCardSkeleton key={idx} />
              ))
            ) : properties.length === 0 ? (
              <p className="text-center col-span-full text-gray-500">No properties found.</p>
            ) : (
              properties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  onOpenCompare={() => setShowCompareModal(true)}
                />
              ))
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded border disabled:opacity-50"
            >
              Previous
            </button>

            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <CompareModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
      />
    </div>
  );
}
