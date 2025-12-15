
import React, { useState } from 'react';
import { MapPin, Bed, Bath, Maximize, ShieldCheck, CheckCircle, Lock } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onClick: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Construct precise Google Maps Query
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.location.address}, ${property.location.municipality}, ${property.location.province}, Angola`)}`;

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group border border-gray-100"
      onClick={() => onClick(property.id)}
    >
      <div className="relative h-48 overflow-hidden bg-gray-200">
        {/* Skeleton Loader: Visible while image is loading */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gray-300 animate-pulse z-10" />
        )}

        <img 
          src={property.images[0]} 
          alt={property.title} 
          loading="lazy"
          decoding="async"
          onLoad={() => setIsImageLoaded(true)}
          className={`w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        
        <div className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded shadow z-20">
          {property.listingType.toUpperCase()}
        </div>

        {/* Security & Trust Badges */}
        <div className="absolute top-3 right-3 flex flex-col items-end space-y-1 z-20">
            {property.isVerified && (
                <div className="bg-white/95 backdrop-blur text-brand-700 text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center border border-brand-200">
                    <ShieldCheck className="w-3 h-3 mr-1 text-brand-600" />
                    <span>VERIFICADO</span>
                </div>
            )}
            {property.isGuaranteed && (
              <div className="bg-accent-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                <span>GARANTIDO</span>
              </div>
            )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{property.title}</h3>
        </div>
        
        <p className="text-xl font-bold text-brand-600 mb-2">
          {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: property.currency }).format(property.price)}
          <span className="text-sm text-gray-500 font-normal"> /mês</span>
        </p>

        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <a 
            href={googleMapsUrl}
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} // Prevent card click event
            className="truncate hover:text-brand-500 hover:underline z-10 transition-colors"
            title="Ver localização no Google Maps"
          >
            {property.location.municipality}, {property.location.province}
          </a>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Maximize className="w-4 h-4" />
            <span>{property.area} m²</span>
          </div>
        </div>

        {property.isGuaranteed && (
            <div className="mt-3 bg-accent-50 px-2 py-1 rounded border border-accent-100 flex items-center">
                <CheckCircle className="w-3 h-3 text-accent-600 mr-2" />
                <span className="text-xs text-accent-700 font-medium">Kiá Verify & Kiá Contract</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
