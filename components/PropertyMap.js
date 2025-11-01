import { useEffect, useRef } from "react";

const PropertyMap = ({ lat, lng, title }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!lat || !lng) return;

    const initMap = () => {
      if (!mapRef.current) return;

      // Initialize Google Map
      const map = new google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      // Add marker
      new google.maps.Marker({
        position: { lat, lng },
        map,
        title: title || "Property Location",
      });
    };

    // Load Google Maps script only once
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [lat, lng, title]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[500px] md:h-[500px] rounded-lg border border-gray-200 shadow-md"
    />
  );
};

export default PropertyMap;
