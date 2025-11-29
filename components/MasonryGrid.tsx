
import React, { useRef, useState, useEffect } from 'react';
import { PortfolioItem, COLOR_HEX_MAP } from '../types';
import { Calendar, Layers, Gift, Play } from 'lucide-react';

interface MasonryGridProps {
  items: PortfolioItem[];
  onTagClick?: (type: 'color' | 'holiday' | 'majorCategory' | 'type', value: string) => void;
  onItemClick?: (item: PortfolioItem) => void;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ items, onTagClick, onItemClick }) => {
  const [columns, setColumns] = useState(3);

  // Hook to update column count based on window width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setColumns(1);
      } else if (window.innerWidth < 1024) {
        setColumns(2);
      } else {
        setColumns(3); // Max 3 columns as requested
      }
    };
    
    // Initial call
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p className="text-lg">沒有找到符合條件的作品。</p>
      </div>
    );
  }

  // 1. Sort items by Date Descending (Newest first)
  const sortedItems = [...items].sort((a, b) => {
    // Check if dates are valid
    const dateA = a.dateCreated ? new Date(a.dateCreated).getTime() : 0;
    const dateB = b.dateCreated ? new Date(b.dateCreated).getTime() : 0;
    return dateB - dateA;
  });

  // 2. Distribute items into columns (Left -> Right logic)
  // Col 1: Index 0, 3, 6...
  // Col 2: Index 1, 4, 7...
  // Col 3: Index 2, 5, 8...
  const columnItems: PortfolioItem[][] = Array.from({ length: columns }, () => []);
  
  sortedItems.forEach((item, index) => {
    const colIndex = index % columns;
    columnItems[colIndex].push(item);
  });

  // Helper to check if URL is video
  const isVideo = (url: string) => {
    if (!url) return false;
    // Basic check, might be fragile if url doesn't have extension, but works for most direct links
    // Added safety check for string type
    if (typeof url !== 'string') return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  };

  return (
    <div className="flex gap-6 p-4 items-start">
      {columnItems.map((col, colIndex) => (
        <div key={colIndex} className="flex-1 space-y-8 flex flex-col">
          {col.map((item) => (
            <CardItem 
              key={item.id} 
              item={item} 
              onTagClick={onTagClick} 
              onItemClick={onItemClick}
              isVideo={isVideo(item.imageUrl)}
            />
          ))}
        </div>
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
                    // Auto-play was prevented
                    // console.log("Autoplay prevented");
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
    const colorString = typeof item.color === 'string' ? item.color : '';
    const colors = colorString ? colorString.split(',').filter(Boolean) : [];

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

    // Check if this is an EDM type to scale it down visually in the grid
    const isEDM = item.type === 'EDM';

    return (
        <div 
          className="group cursor-pointer w-full"
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
                <div className={`relative ${isEDM ? 'flex justify-center bg-gray-100' : ''}`}>
                    <img 
                      src={item.imageUrl} 
                      alt=""
                      // If EDM, force 50% width and center it. Otherwise full width.
                      className={`${isEDM ? 'w-1/2' : 'w-full'} h-auto object-cover transform group-hover:scale-105 transition-transform duration-500`}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
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
            
            {/* Title - Ensures it is displayed */}
            {item.title && (
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                {item.title}
                </h3>
            )}

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

              {/* Colors (Morandi BG + White Text) */}
              {colors.map(color => (
                 <button 
                   key={color}
                   onClick={(e) => { e.stopPropagation(); onTagClick?.('color', color); }}
                   className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full hover:opacity-80 transition-opacity shadow-sm text-white"
                   style={{ 
                     backgroundColor: COLOR_HEX_MAP[color] || '#d1d5db',
                     color: color === '白色' ? '#4b5563' : 'white'
                   }}
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
