import React from 'react';

interface IframeMapProps {
  mapSrc: string;
  fallbackAddress?: string;
}

const IframeMap: React.FC<IframeMapProps> = ({ mapSrc, fallbackAddress }) => {
  // Check if we have a valid map source
  const hasValidMapSrc = mapSrc && mapSrc.trim() !== '';
  
  // If no valid map source, try to create a Google Maps embed URL from the address
  const googleMapsUrl = !hasValidMapSrc && fallbackAddress 
    ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(fallbackAddress)}`
    : '';
  
  // Use the provided map source or fall back to the Google Maps URL
  const srcToUse = hasValidMapSrc ? mapSrc : googleMapsUrl;
  
  return (
    <div className="w-full h-full">
      {srcToUse ? (
        <iframe
          src={srcToUse}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-xl"
        ></iframe>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
          <p className="text-gray-500">Map not available</p>
        </div>
      )}
    </div>
  );
};

export default IframeMap; 