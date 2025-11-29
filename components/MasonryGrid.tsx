
import React, { useRef } from 'react';
import { PortfolioItem, COLOR_HEX_MAP } from '../types';
import { Calendar, Layers, Gift, Play } from 'lucide-react';

interface MasonryGridProps {
  items: PortfolioItem[];
  onTagClick?: (type: 'color' | 'holiday' | 'majorCategory' | 'type', value: string) => void;
  onItemClick?: (item: PortfolioItem) => void;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ items, onTagClick, onItemClick }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p className="text-lg">沒有找到符合條件的作品。</p>
      </div>
    );
  }

  // Helper to check if URL is video
  const isVideo = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  };

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-8 p-4">
      {items.map((item) => (
        <CardItem 
          key={item.id} 
          item={item} 
          onTagClick={onTagClick} 
          onItemClick={onItemClick}
          isVideo={isVideo(item.imageUrl)}
        />
      ))}
    </div>
  );
};

// Extracted Card Component
const CardItem = ({ 
    item, 
    onTagClick, 
    onItemClick,
    isVideo
}: { 
    item: PortfolioItem, 
    onTagClick?: any, 
    onItemClick?: any,
    isVideo: boolean
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleMouseEnter = () => {
        if (isVideo && videoRef.current) {
            const promise = videoRef.current.play();
            if (promise !== undefined) {
                promise.catch(error => {
                    console.log("Autoplay prevented", error);
                });
            }
        }
    };

    const handleMouseLeave = () => {
        if (isVideo && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0; // Reset to start
        }
    };

    // Parse colors
    const colors = item.color ? item.color.split(',').filter(Boolean) : [];

    // Date formatting: YYYY-MM
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString; // Fallback if invalid
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            return `${year}-${month}`;
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div 
          className="break-inside-avoid group cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => onItemClick?.(item)}
        >
          {/* Media Container (Rounded, Shadowed) */}
          <div className="relative overflow-hidden bg-gray-200 rounded-xl shadow-sm group-hover:shadow-xl transition-all duration-300">
            {isVideo ? (
                <div className="relative w-full">
                    <video 
                        ref={videoRef}
                        src={item.imageUrl}
                        className="w-full h-auto object-cover"
                        muted
                        playsInline
                        loop
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300 bg-black/10">
                        <div className="bg-black/30 backdrop-blur-sm rounded-full p-4 border border-white/50">
                            <Play fill="white" className="text-white translate-x-0.5" size={32} />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </>
            )}
            
            {/* Overlay Tags (Type) */}
            {item.type && (
               <button 
                 onClick={(e) => { e.stopPropagation(); onTagClick?.('type', item.type!); }}
                 className="absolute top-3 left-3 hover:scale-105 transition-transform z-10"
               >
                 <span className="inline-flex items-center px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold rounded-md shadow-sm">
                   <Layers size={10} className="mr-1"/> {item.type}
                 </span>
               </button>
            )}
          </div>

          {/* Content Info (Transparent Background matching page) */}
          <div className="pt-3 px-1">
            
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
              {item.title}
            </h3>

            {/* Tags Row */}
            <div className="flex flex-wrap gap-2 mb-2">
              {/* Major Category */}
              {item.majorCategory && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onTagClick?.('majorCategory', item.majorCategory!); }}
                  className="inline-block px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md hover:bg-indigo-100 transition-colors"
                >
                   {item.majorCategory}
                </button>
              )}
              
              {/* Holiday */}
              {item.holiday && (
                 <button 
                   onClick={(e) => { e.stopPropagation(); onTagClick?.('holiday', item.holiday!); }}
                   className="inline-flex items-center px-2 py-1 text-xs text-red-600 bg-red-50 border border-red-100 rounded-md hover:bg-red-100 transition-colors"
                 >
                   <Gift size={10} className="mr-1"/> {item.holiday}
                 </button>
              )}

              {/* Colors (Colored BG + White Text) */}
              {colors.map(color => (
                 <button 
                   key={color}
                   onClick={(e) => { e.stopPropagation(); onTagClick?.('color', color); }}
                   className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full hover:opacity-80 transition-opacity shadow-sm text-white"
                   style={{ backgroundColor: COLOR_HEX_MAP[color] || '#9ca3af' }}
                 >
                   {color}
                 </button>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-1">
               <span className="flex items-center text-xs text-gray-400 font-medium">
                <Calendar size={12} className="mr-1" />
                {formatDate(item.dateCreated)}
              </span>
            </div>
          </div>
        </div>
    );
}

export default MasonryGrid;
