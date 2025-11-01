import { useRouter } from 'next/router';
import { useCompare } from '../context/CompareContext';
import { useFavorites } from '../context/FavoritesContext';
import { toast } from 'react-toastify';
import { ArrowsRightLeftIcon, XMarkIcon, HeartIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Rating from "react-rating";
import { StarIcon } from '@heroicons/react/24/solid';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PropertyCard({ property, onOpenCompare }) {
  const router = useRouter();
  const { compareList, toggleCompare } = useCompare();
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorited = favorites.some(fav => fav._id === property._id);

  const getImageUrl = (img) =>
    img?.startsWith('http') ? img : `${API_URL}/uploads/${img}`;

  // Favorite button  
  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    try {
      await toggleFavorite(property); // returns boolean
    } catch (err) {
      console.error('Toggle favorite error:', err.response?.data || err.message);
      toast.error('Failed to update favorite');
    }
  };

  // Compare button
  const handleCompareClick = (e) => {
    e.stopPropagation();
    toggleCompare(property._id);
    if (onOpenCompare) onOpenCompare();
  };

  // Opens Google Maps
  const handleViewLocationClick = () => {
    const lat = property.location?.coordinates?.[1];
    const lng = property.location?.coordinates?.[0];
    if (!lat || !lng) {
      toast.error('Location not available for this property');
      return;
    }
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="h-full-properties-card border rounded-lg overflow-hidden shadow-md card-group cursor-pointer hover:shadow-lg transition-shadow duration-300">
    {/* Image Section */}
      <div
        className="relative"
        onClick={() => router.push(`/properties/${property._id}`)}
      >
        {property.images?.length > 0 ? (
          <img
            src={getImageUrl(property.images[0])}
            alt={property.title}
            className="h-56 w-full object-cover"
            onClick={() => router.push(`/properties/${property._id}`)}
          />
        ) : (
          <div className="h-56 w-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center">
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/properties/${property._id}`); }}
            className="bg-white text-black font-medium py-2 px-4 rounded hover:bg-gray-200"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-lg font-semibold"  onClick={() => router.push(`/properties/${property._id}`)}>{property.title}</h3>

        {property.bhkType && (
          <p className="text-sm text-gray-600 mb-1">{property.bhkType}</p>
        )}

        {/* ⭐ Rating Stars */}
        <div className="flex items-center gap-1 mb-2">
          <Rating
            readonly
            initialRating={property.averageRating || 0}
            emptySymbol={<StarIcon className="w-4 h-4 text-gray-300" />}
            fullSymbol={<StarIcon className="w-4 h-4 text-yellow-400" />}
          />
          <span className="text-xs text-gray-600">
            ({property.reviews?.length || 0})
          </span>
        </div>

        {property.price && (
          <p className="text-green-600 font-bold">
            ₹ {Number(property.price).toLocaleString()}
          </p>
        )}

        {(property.city || property.address) && (
          <p className="text-sm text-gray-600">
            {[property.address, property.city].filter(Boolean).join(', ')}
          </p>
        )}

        <div className="flex gap-3 mt-4 flex-wrap justify-center">
          {/* Compare Button */}
          <div className="relative group">
            <button
              onClick={handleCompareClick}
              className={`px-3 py-2 rounded-md transition flex items-center justify-center ${
                compareList.includes(property._id)
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {compareList.includes(property._id) ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <ArrowsRightLeftIcon className="h-5 w-5" />
              )}
            </button>

            {/* Tooltip */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 px-2 py-1 text-xs rounded bg-gray-800 text-white whitespace-nowrap transition-opacity duration-200">
              {compareList.includes(property._id)
                ? "Remove from Compare"
                : "Add to Compare"}
            </span>
          </div>

          {/* Favorite Button */}
          <div className="relative group">
            <button
              onClick={handleFavoriteClick}
              className="px-3 py-2 rounded-md transition flex items-center justify-center bg-yellow-500 text-white hover:bg-yellow-600"
            >
              <HeartIcon
                className={`h-5 w-5 ${
                  isFavorited ? "fill-current text-white" : ""
                }`}
              />
            </button>

            {/* Tooltip */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 px-2 py-1 text-xs rounded bg-gray-800 text-white whitespace-nowrap transition-opacity duration-200">
              {isFavorited ? "Remove from Favorites" : "Add to Favorites"}
            </span>
          </div>

          {/* View Location Button */}
          {property.location?.coordinates?.length === 2 && (
            <div className="relative group">
              <button
                className="px-3 py-2 rounded-md text-white bg-green-500 hover:bg-green-600 transition flex items-center justify-center gap-1"
                onClick={handleViewLocationClick}
              >
                <MapPinIcon className="h-5 w-5" />
              </button>

              {/* Tooltip */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 px-2 py-1 text-xs rounded bg-gray-800 text-white whitespace-nowrap transition-opacity duration-200">
                View Location on Map
              </span>
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
}
