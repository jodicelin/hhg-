
import React, { useRef, useState, useEffect } from 'react';
import { PortfolioItem, COLOR_HEX_MAP } from '../types';
import { Play } from 'lucide-react';

interface MasonryGridProps {
  items: PortfolioItem[];
  onTagClick?: (type: 'color' | 'holiday' | 'majorCategory' | 'type', value: string) => void;
  onItemClick?: (item: PortfolioItem) => void;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ items, onTagClick, onItemClick }) => {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setColumns(1);
      } else if (window.innerWidth < 1024) {
        setColumns(2);
      } else {
        setColumns(3); 
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-600">
        <p className="text-lg font-medium">No works found.</p>
      </div>
    );
  }

  const sortedItems = [...items].sort((a, b) => {
    // Sort by Date string (YYYY-MM) descending
    const dateA = a.date || '';
    const dateB = b.date || '';
    return dateB.localeCompare(dateA);
  });

  const columnItems: PortfolioItem[][] = Array.from({ length: columns }, () => []);
  sortedItems.forEach((item, index) => {
    const colIndex = index % columns;
    columnItems[colIndex].push(item);
  });

  const isVideo = (url: string) => {
    if (!url || typeof url !== 'string') return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  };

  return (
    <div className="flex gap-6 px-4 sm:px-6 lg:px-8 items-start">
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

interface CardItemProps {
    item: PortfolioItem;
    onTagClick?: (type: 'color' | 'holiday' | 'majorCategory' | 'type', value: string) => void;
    onItemClick?: (item: PortfolioItem) => void;
    isVideo: boolean;
}

const CardItem: React.FC<CardItemProps> = ({ 
    item, 
    onTagClick, 
    onItemClick,
    isVideo
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleMouseEnter = () => {
        if (isVideo && videoRef.current) {
            const promise = videoRef.current.play();
            if (promise !== undefined) {
                promise.catch(error => {});
            }
        }
    };

    const handleMouseLeave = () => {
        if (isVideo && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0; 
        }
    };

    const isEDM = item.type === 'EDM';

    return (
        <div 
          className="group cursor-pointer w-full flex flex-col gap-3"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => onItemClick?.(item)}
        >
          {/* Media Container - Clean, No Text, Big Rounded Corners */}
          <div className="relative overflow-hidden bg-white dark:bg-brand-dark-card rounded-[1.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-white/5">
            {isVideo ? (
                <div className="relative w-full">
                    <video 
                        ref={videoRef}
                        src={`${item.imageUrl}#t=0.001`} // Use first frame as poster
                        className="w-full h-auto object-cover"
                        muted
                        playsInline
                        loop
                        preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                        <div className="bg-brand-yellow/90 backdrop-blur-sm rounded-full p-4 shadow-lg transform group-hover:scale-110 transition-transform">
                            <Play fill="black" className="text-black translate-x-0.5" size={24} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`relative ${isEDM ? 'flex justify-center bg-gray-50 dark:bg-black/20 py-4' : ''}`}>
                    <img 
                      src={item.imageUrl} 
                      alt=""
                      className={`${isEDM ? 'w-1/2' : 'w-full'} h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out`}
                      loading="lazy"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
            )}
          </div>
        </div>
    );
}

export default MasonryGrid;
