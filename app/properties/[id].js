import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Modal from 'react-modal';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import PropertyCard from '../../components/PropertyCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import axios from '../../utils/axiosInstance';
import GetQuoteForm from "../../components/GetQuoteForm";
import { useCompare } from "../../context/CompareContext";
import CompareModal from '../../components/CompareModal'; 
import { useFavorites } from '../../context/FavoritesContext';
import { toast } from 'react-toastify';
import { ArrowsRightLeftIcon, XMarkIcon, HeartIcon, MapPinIcon } from '@heroicons/react/24/outline';
import PropertyCardSkeleton from '../../skeleton/PropertyCardSkeleton';
import PropertyMap from '../../components/PropertyMap';
import { defaultAmenities } from '../../utils/amenities';


import ReviewForm from '../../components/PropertyReview';
import Rating from 'react-rating';
import { StarIcon } from '@heroicons/react/24/solid';


const API_URL = process.env.NEXT_PUBLIC_API_URL;



const PropertyDetail = () => {
  const router = useRouter();
  const { id } = router.query;

  const [clientId, setClientId] = useState(null);
  //const [property, setProperty] = useState({});
  const [property, setProperty] = useState({ reviews: [] });
  const reviewSectionRef = useRef(null);
  
  const [relatedProperties, setRelatedProperties] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const { compareList, toggleCompare } = useCompare();
  const { favorites, toggleFavorite } = useFavorites();

  const [activeTab, setActiveTab] = useState(null);

  

  const [rating, setRating] = useState(0);

  const [showCompareModal, setShowCompareModal] = useState(false); // ⬅️ new state

  const handleCompareClick = () => {
    toggleCompare(property._id);
    setShowCompareModal(true); // open modal after toggling
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


  useEffect(() => {
    if (!id) return;

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`/properties/${id}/reviews`);
        setProperty({
          name: res.data.propertyName,
          averageRating: res.data.averageRating,
          reviews: res.data.reviews.filter(r => r.approved),
        });
      } catch (err) {
        console.error("Fetch reviews error:", err.response?.data || err.message);
      }
    };

    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (!activeTab && property?.propertyType && defaultAmenities[property.propertyType]) {
      const firstGroup = Object.keys(defaultAmenities[property.propertyType])[0];
      setActiveTab(firstGroup);
    }
  }, [property, activeTab]);

  useEffect(() => {
    Modal.setAppElement('#__next');
  }, []);

  useEffect(() => {
    if (id) setClientId(id);
  }, [id]);

  useEffect(() => {
    if (clientId) {
      axios.get('/properties/' + clientId)
        .then(res => setProperty(res.data))
        .catch(err => console.error(err));
    }
  }, [clientId]);

  useEffect(() => {
    if (property && property._id) {
      axios.get('/properties?limit=6')
        .then(res => {
          const data = Array.isArray(res.data) ? res.data 
                     : Array.isArray(res.data?.properties) ? res.data.properties 
                     : [];
          setRelatedProperties(data);
        })
        .catch(err => {
          console.error(err);
          setRelatedProperties([]); // fallback to empty array on error
        });
    }
  }, [property]);
  

  const openImageModal = (index) => {
    setActiveImageIndex(index);
    setModalMode('image');
    setModalIsOpen(true);
  };

  const openFormModal = () => {
    setModalMode('form');
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalMode(null);
    setThumbsSwiper(null);
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    closeModal();
  };


  // Loading skeleton while property is null
  if (!property) {
    return (
      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <PropertyCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4">
        {property.title} ({property.bhkType !== 'N/A' ? property.bhkType : property.propertyType})
        , {property.city}
        </h1>

        <div className="md:flex md:gap-6 mb-6">
          <div className="md:w-1/2 mb-4 md:mb-0">
          <div>
              {/* Big Main Image */}
              {(property.images && property.images.length > 0) ? (
                <img
                  src={
                    property.images[activeImageIndex].startsWith('http') 
                      ? property.images[activeImageIndex] 
                      : `${API_URL}/uploads/${property.images[activeImageIndex]}`
                  }
                  alt={`${property.title} ${activeImageIndex + 1}`}
                  className="w-full h-80 object-cover rounded-md cursor-pointer mb-4"
                  onClick={() => openImageModal(activeImageIndex)}
                />
              ) : (
                <div className="h-80 w-full bg-gray-200 flex items-center justify-center text-gray-500 mb-4">
                  No Image
                </div>
              )}

              {/* Thumbnails + +X */}
              <div className="flex gap-2">
                {(property.images || []).slice(0, 3).map((img, idx) => (
                  <img
                    key={idx}
                    src={img.startsWith('http') ? img : `${API_URL}/uploads/${img}`}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`w-25 h-20 object-cover rounded-md cursor-pointer border-2 ${
                      activeImageIndex === idx ? 'border-blue-600' : 'border-transparent'
                    }`}
                    onClick={() => setActiveImageIndex(idx)}
                  />
                ))}

                {(property.images || []).length > 3 && (
                  <div
                    onClick={() => openImageModal(3)} // open modal starting at 4th image
                    className="w-20 h-20 bg-gray-300 rounded-md flex items-center justify-center text-lg font-semibold cursor-pointer select-none"
                  >
                    +{property.images.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:w-1/2 text-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div><strong>Property Type:</strong> <p>{property.propertyType || '-'}</p></div>
              <div><strong>Super Builtup Area:</strong> <p>{property.superBuiltupArea || '-'}</p></div>
              <div><strong>Transaction Type:</strong> <p>{property.transactionType || '-'}</p></div>
              <div><strong>Bedrooms:</strong> <p>{property.bedrooms || '-'}</p></div>
              <div><strong>Bathrooms:</strong> <p>{property.bathrooms || '-'}</p></div>
              <div><strong>Project:</strong> <p>{property.project || '-'}</p></div>
              <div><strong>Status:</strong> <p>{property.status || '-'}</p></div>
              <div><strong>Furnishing Status:</strong> <p>{property.furnishing || '-'}</p></div>
              <div><strong>Price:</strong> <p>{property.price ? `₹${property.price.toLocaleString()}` : '-'}</p></div>
              
            </div>
            {/* ⭐ Rating Stars */}
            <div
              className="flex items-center gap-1 mb-2 mt-10 cursor-pointer"
              onClick={() => {
                reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
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


            
            {/* Compare Modal */}
            <CompareModal
              isOpen={showCompareModal}
              onClose={() => setShowCompareModal(false)}
            />

          </div>

          
        </div>

        <div className="flex gap-3 mt-8 justify-end">
          <button
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
            onClick={openFormModal}
          >
            Get Quote
          </button>

            {/* Compare Button */}
            <button
              onClick={handleCompareClick}
              className={`relative group px-3 py-2 rounded-md transition flex items-center justify-center ${
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

              {/* Tooltip */}
              <span
                className="absolute bottom-full mb-2 hidden group-hover:flex px-2 py-1 text-xs rounded bg-gray-800 text-white whitespace-nowrap"
              >
                {compareList.includes(property._id) ? "Remove from Compare" : "Add to Compare"}
              </span>
            </button>

          {/* Favorites Button */}
          <button
            onClick={async () => {
              try {
                const isNowFavorited = await toggleFavorite(property); // ✅ pass full object
                if (isNowFavorited) {
                  toast.success(`${property.title} added to favorites`);
                } else {
                  toast.info(`${property.title} removed from favorites`);
                }
              } catch (err) {
                console.error("Toggle favorite error:", err);
                toast.error("Failed to update favorite");
              }
            }}
            className="relative group px-3 py-2 rounded-md transition flex items-center justify-center
              bg-yellow-500 text-white hover:bg-yellow-600"
          >
            {/* Heart Icon */}
            <HeartIcon
              className={`h-6 w-6 ${
                favorites.some((fav) => fav._id === property._id)
                  ? "fill-current text-white"
                  : ""
              }`}
            />

            {/* Tooltip */}
            <span
              className="absolute bottom-full mb-2 hidden group-hover:flex px-2 py-1 text-xs rounded bg-gray-800 text-white whitespace-nowrap"
            >
              {favorites.some((fav) => fav._id === property._id)
                ? "Remove from Favorites"
                : "Add to Favorites"}
            </span>
          </button>


          {property.location?.coordinates?.length === 2 && (
                <button
                  onClick={handleViewLocationClick}
                  className="relative group px-3 py-2 rounded-md flex items-center justify-center 
                    bg-green-500 text-white hover:bg-green-600 transition"
                >
                  {/* Location Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21c-4.5-4.5-7.5-8.25-7.5-12A7.5 7.5 0 1119.5 9c0 3.75-3 7.5-7.5 12z"
                    />
                    <circle cx="12" cy="9" r="2.5" fill="currentColor" />
                  </svg>

                  {/* Tooltip */}
                  <span
                    className="absolute bottom-full mb-2 hidden group-hover:flex px-2 py-1 text-xs rounded 
                      bg-gray-800 text-white whitespace-nowrap"
                  >
                    View Location
                  </span>
                </button>
              )}




        </div>
      </div>


      {/* Property Map Section */}
      {property.location?.coordinates?.length === 2 && (
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6 mt-2">
          <h2 className="text-2xl font-bold mb-4">Property Location</h2>

          {/* Pass latitude and longitude correctly */}
          <PropertyMap
            lat={property.location.coordinates[1]} // latitude
            lng={property.location.coordinates[0]} // longitude
            title={property.title}
          />
        </div>
      )}

      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6 mt-2">
        <h1 className="text-3xl font-bold mb-4">More Details</h1>
        <p className="mb-6 text-gray-600"><strong>Property Name:</strong> {property.title} ({property.bhkType !== 'N/A' ? property.bhkType : property.propertyType})
        </p>
        <p className="mb-6 text-gray-600"><strong>Developer:</strong> {property.developer || '-'}</p>
        <p className="mb-6 text-gray-600"><strong>Price:</strong> {property.price ? `₹${property.price.toLocaleString()}` : '-'}</p>
        <p className="mb-6 text-gray-600"><strong>Address:</strong> {property.address || '-'}, {property.city || '-'}</p>
        <p className="mb-6 text-gray-600"><strong>Description:</strong> {property.description || '-'}</p>


        <div className="flex gap-3 mt-8">
              <button
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
                onClick={openFormModal}
              >
                Get Quote
              </button>

              {/* Compare Button */}
              <button
                onClick={handleCompareClick}
                className={`relative group px-3 py-2 rounded-md transition flex items-center justify-center ${
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

                {/* Tooltip */}
                <span
                  className="absolute bottom-full mb-2 hidden group-hover:flex px-2 py-1 text-xs rounded bg-gray-800 text-white whitespace-nowrap"
                >
                  {compareList.includes(property._id) ? "Remove from Compare" : "Add to Compare"}
                </span>
              </button>



              {/* Favorites Button */}
              <button
                onClick={async () => {
                  try {
                    const isNowFavorited = await toggleFavorite(property); 
                    if (isNowFavorited) {
                      toast.success(`${property.title} added to favorites`);
                    } else {
                      toast.info(`${property.title} removed from favorites`);
                    }
                  } catch (err) {
                    console.error("Toggle favorite error:", err);
                    toast.error("Failed to update favorite");
                  }
                }}
                className="relative group px-3 py-2 rounded-md transition flex items-center justify-center
                  bg-yellow-500 text-white hover:bg-yellow-600"
              >
                {/* Heart Icon */}
                <HeartIcon
                  className={`h-6 w-6 ${
                    favorites.some((fav) => fav._id === property._id)
                      ? "fill-current text-white"
                      : ""
                  }`}
                />

                {/* Tooltip */}
                <span
                  className="absolute bottom-full mb-2 hidden group-hover:flex px-2 py-1 text-xs rounded bg-gray-800 text-white whitespace-nowrap"
                >
                  {favorites.some((fav) => fav._id === property._id)
                    ? "Remove from Favorites"
                    : "Add to Favorites"}
                </span>
              </button>


              {property.location?.coordinates?.length === 2 && (
                <button
                  onClick={handleViewLocationClick}
                  className="relative group px-3 py-2 rounded-md flex items-center justify-center 
                    bg-green-500 text-white hover:bg-green-600 transition"
                >
                  {/* Location Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21c-4.5-4.5-7.5-8.25-7.5-12A7.5 7.5 0 1119.5 9c0 3.75-3 7.5-7.5 12z"
                    />
                    <circle cx="12" cy="9" r="2.5" fill="currentColor" />
                  </svg>

                  {/* Tooltip */}
                  <span
                    className="absolute bottom-full mb-2 hidden group-hover:flex px-2 py-1 text-xs rounded 
                      bg-gray-800 text-white whitespace-nowrap"
                  >
                    View Location
                  </span>
                </button>
              )}


            </div>
      </div>


     
        {/* Amenities Section */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6 mt-2">
              <div className="mt-6">
            
              {property.propertyType && defaultAmenities[property.propertyType] && (
                <div className="mt-6">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    Amenities
                  </h3>

                  {/* Tabs Header */}
                  <div className="flex flex-wrap gap-2 border-b pb-2">
                    {Object.keys(defaultAmenities[property.propertyType]).map((groupName) => (
                      <button
                        key={groupName}
                        onClick={() => setActiveTab(groupName)}
                        className={`px-4 py-2 rounded-t-md border-b-2 transition-colors duration-200 ${
                          activeTab === groupName
                            ? 'border-black-700 text-black-600 font-semibold'
                            : 'border-transparent text-black-600 hover:text-black-500'
                        }`}
                      >
                        {groupName}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  {Object.entries(defaultAmenities[property.propertyType]).map(([groupName, groupItems]) => {
                    if (activeTab !== groupName) return null;

                    const available = groupItems.filter((a) => property.amenities.includes(a));
                    if (available.length === 0) return (
                      <p key={groupName} className="text-gray-500 mt-3">
                        No amenities available in this category.
                      </p>
                    );

                    return (
                      <div key={groupName} className="mt-4">
                        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {available.map((a) => (
                            <li key={a} className="flex items-center text-gray-700">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-black-600 mr-2 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
              </div>
            </div>
          )}




        {/* Reviews Section */}
        <div
          ref={reviewSectionRef}
          className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6 mt-2"
        >
          <h3 className="text-xl font-semibold mb-2">Reviews</h3>

          {(property.reviews || []).filter((rev) => rev.approved).length === 0 && (
            <p>No reviews yet</p>
          )}

          <ul>
            {(property.reviews || [])
              .filter((rev) => rev.approved) 
              .map((rev, idx) => (
                <li key={idx} className="border-b py-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{rev.name}</span>
                    <Rating
                      readonly
                      initialRating={rev.rating}
                      emptySymbol={<StarIcon className="w-5 h-5 text-gray-300" />}
                      fullSymbol={<StarIcon className="w-5 h-5 text-yellow-400" />}
                    />
                  </div>
                  <p>{rev.message}</p>
                </li>
              ))}
          </ul>
        </div>

        {/* Review Submission Form */}

        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6 mt-2">
          <h2 className="text-2xl font-bold mb-4">Submit Your Review</h2>
          <ReviewForm
            propertyId={property._id}
            onSuccess={(data) => {
              setProperty((prev) => ({
                ...prev,
                reviews: data.reviews || [],
                averageRating: data.averageRating || 0,
              }));
              setRating(data.averageRating);
            }}
          />
        </div>

      <div className="max-w-5xl mx-auto mt-12">
        <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {relatedProperties.length === 0
              ? Array.from({ length: 6 }).map((_, idx) => <PropertyCardSkeleton key={idx} />)
              : relatedProperties.map(rp => <PropertyCard key={rp._id} property={rp} onOpenCompare={() => setShowCompareModal(true)} />)
            }
        </div>
      </div>

      <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel={modalMode === 'image' ? "Property Images" : "Get Quote Form"}
          className={`max-w-4xl mx-auto mt-20 p-6 rounded shadow-lg outline-none relative properties-get-quate-modal ${modalMode === 'image' ? "bg-white" : ""}`}
          overlayClassName="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-start"
        >

      
        {modalMode === 'image' && property.images?.length > 0 && (
          <>
           <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-3xl font-bold text-gray-800 hover:text-gray-600 close-btn"
            >
            <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="30px" height="30px">
              <path d="M 7.71875 6.28125 L 6.28125 7.71875 L 23.5625 25 L 6.28125 42.28125 L 7.71875 43.71875 L 25 26.4375 L 42.28125 43.71875 L 43.71875 42.28125 L 26.4375 25 L 43.71875 7.71875 L 42.28125 6.28125 L 25 23.5625 Z"/>
            </svg>
            </button>
            <Swiper
              spaceBetween={10}
              slidesPerView={1}
              navigation={true}
              modules={[Navigation, Pagination, Thumbs]}
              thumbs={thumbsSwiper ? { swiper: thumbsSwiper } : undefined}
              initialSlide={activeImageIndex}
              onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
            >
              {property.images.map((img, idx) => (
                <SwiperSlide key={`slide-${idx}`}>
                  <div style={{ height: '70vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img
                      src={img.startsWith('http') ? img : `${API_URL}/uploads/${img}`}
                      alt={`Property Slide ${idx}`}
                      style={{ height: '100%', width: 'auto', objectFit: 'contain', borderRadius: '0.375rem' }}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>


            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView={Math.min(5, property.images.length)}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[Thumbs]}
              className="mt-0 max-w-md"
            >
              {property.images.map((img, idx) => (
                <SwiperSlide key={`thumb-${idx}`} className="cursor-pointer">
                  <img
                    src={img.startsWith('http') ? img : `${API_URL}/uploads/${img}`}
                    alt={`Thumbnail ${idx}`}
                    className={`w-full h-20 object-cover rounded-md border-2 ${idx === activeImageIndex ? 'border-blue-600' : 'border-transparent'}`}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </>
        )}

        {modalMode === "form" && property._id && (
          <GetQuoteForm propertyId={property._id} onClose={closeModal} />
        )}

      </Modal>
    </div>
  );
};

export default PropertyDetail;
