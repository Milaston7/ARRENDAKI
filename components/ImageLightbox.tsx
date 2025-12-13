import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ 
  isOpen, 
  onClose, 
  images, 
  activeIndex, 
  onIndexChange 
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onIndexChange((activeIndex - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') onIndexChange((activeIndex + 1) % images.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, activeIndex, images.length, onClose, onIndexChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm animate-fadeIn">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[110]"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Navigation - Left */}
      {images.length > 1 && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onIndexChange((activeIndex - 1 + images.length) % images.length);
          }}
          className="absolute left-4 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-[110]"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
      )}

      {/* Main Image Container */}
      <div className="w-full h-full p-4 md:p-12 flex items-center justify-center relative">
        <img 
          src={images[activeIndex]} 
          alt={`View ${activeIndex + 1}`}
          className="max-w-full max-h-full object-contain select-none shadow-2xl rounded-sm"
        />
        
        {/* Counter Badge */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/90 font-medium px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-sm border border-white/10">
            {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Navigation - Right */}
      {images.length > 1 && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onIndexChange((activeIndex + 1) % images.length);
          }}
          className="absolute right-4 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-[110]"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      )}
    </div>
  );
};

export default ImageLightbox;