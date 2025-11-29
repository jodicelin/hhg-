
import React, { useState, useMemo, useEffect } from 'react';
import MasonryGrid from '../components/MasonryGrid';
import { PortfolioItem, MAJOR_CATEGORIES, WORK_TYPES, COLORS, HOLIDAYS } from '../types';
import { Filter, XCircle, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface HomeProps {
  items: PortfolioItem[];
  isLoading: boolean;
  searchTerm: string;
}

const Home: React.FC<HomeProps> = ({ items, isLoading, searchTerm }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedHoliday, setSelectedHoliday] = useState<string>('');
  
  // Lightbox State
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);

  // Advanced Filter Logic
  const filteredItems = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    
    return items.filter(item => {
      // 1. Text Search (passed from Navbar)
      const term = (searchTerm || '').toLowerCase();
      // Ensure fields exist before calling toLowerCase
      const title = (item.title || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const major = (item.majorCategory || '').toLowerCase();

      const matchesSearch = !term || 
        title.includes(term) ||
        desc.includes(term) ||
        cat.includes(term) ||
        major.includes(term);

      // 2. Major Category
      const matchesCategory = selectedCategory === 'All' || item.majorCategory === selectedCategory;

      // 3. Type
      const matchesType = selectedType === 'All' || item.type === selectedType;

      // 4. Color (Partial match since multiple colors can be stored as "Red,Blue")
      const matchesColor = !selectedColor || (item.color || '').includes(selectedColor);

      // 5. Holiday
      const matchesHoliday = !selectedHoliday || item.holiday === selectedHoliday;

      return matchesSearch && matchesCategory && matchesType && matchesColor && matchesHoliday;
    });
  }, [items, searchTerm, selectedCategory, selectedType, selectedColor, selectedHoliday]);

  // Handler for clicking tags inside the card
  const handleTagClick = (type: 'color' | 'holiday' | 'majorCategory' | 'type', value: string) => {
    if (type === 'majorCategory') setSelectedCategory(value);
    if (type === 'type') setSelectedType(value);
    if (type === 'color') setSelectedColor(value);
    if (type === 'holiday') setSelectedHoliday(value);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedType('All');
    setSelectedColor('');
    setSelectedHoliday('');
  };

  const hasActiveFilters = selectedCategory !== 'All' || selectedType !== 'All' || selectedColor || selectedHoliday;

  const isVideo = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  };

  return (
    <main className="max-w-7xl mx-auto min-h-screen relative">
      
      {/* Header Info */}
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <h1 className="text-3xl font-light text-gray-900 mb-2">HHG 視覺靈感庫</h1>
        <p className="text-gray-500 max-w-2xl">
            收錄各類行銷視覺設計作品，激發您的創意靈感。
        </p>
      </div>

      {/* Sticky Filters Container */}
      {/* top-16 accounts for the 64px height of the Navbar */}
      <div className="sticky top-16 z-40 bg-[#f8fafc]/95 backdrop-blur-md border-b border-gray-100 transition-all shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          
          {/* Level 1: Major Categories (Tabs) */}
          <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === 'All' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                全部作品
              </button>
              {MAJOR_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat 
                      ? 'bg-black text-white' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
          </div>

          {/* Level 2: Secondary Filters Row */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white/50 p-3 rounded-xl border border-gray-100">
            
            <div className="flex flex-wrap items-center gap-3 w-full">
                <div className="flex items-center text-sm font-bold text-gray-500 mr-2">
                  <Filter size={16} className="mr-1"/> 篩選
                </div>

                {/* Type Filter */}
                <select 
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-black transition-colors cursor-pointer"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="All">所有類型</option>
                  {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                {/* Color Filter */}
                <select 
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-black transition-colors cursor-pointer"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                >
                  <option value="">所有顏色</option>
                  {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {/* Holiday Filter */}
                <select 
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-black transition-colors cursor-pointer"
                  value={selectedHoliday}
                  onChange={(e) => setSelectedHoliday(e.target.value)}
                >
                  <option value="">所有節日</option>
                  {HOLIDAYS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                
                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    className="ml-auto md:ml-2 flex items-center text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    <XCircle size={14} className="mr-1"/> 清除篩選
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : (
          <MasonryGrid 
            items={filteredItems} 
            onTagClick={handleTagClick} 
            onItemClick={(item) => setLightboxItem(item)}
          />
        )}
      </div>

      {/* Lightbox / Modal - Scrollable Container */}
      {lightboxItem && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md overflow-y-auto animate-fade-in"
          onClick={() => setLightboxItem(null)}
        >
          {/* Close Button fixed to viewport */}
          <button 
            onClick={() => setLightboxItem(null)}
            className="fixed top-6 right-6 z-[110] text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={32} />
          </button>

          <div className="min-h-full flex flex-col items-center justify-center p-4 md:p-12">
             <div 
                className="relative max-w-5xl w-full flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
             >
                 {isVideo(lightboxItem.imageUrl) ? (
                    <video 
                       src={lightboxItem.imageUrl} 
                       className="max-w-full rounded-lg shadow-2xl outline-none" 
                       controls 
                       autoPlay 
                    />
                 ) : (
                    <img 
                      src={lightboxItem.imageUrl} 
                      alt={lightboxItem.title} 
                      // Removed max-h constraint to allow full height scrolling for EDMs
                      className="w-full h-auto object-contain rounded-lg shadow-2xl bg-gray-900"
                    />
                 )}
                 <div className="mt-6 text-center pb-10">
                    <h2 className="text-white text-2xl font-bold tracking-tight">{lightboxItem.title}</h2>
                    <div className="flex gap-2 justify-center mt-3">
                       {lightboxItem.majorCategory && <span className="text-sm font-medium bg-white/10 border border-white/20 text-white px-3 py-1 rounded-full">{lightboxItem.majorCategory}</span>}
                       {lightboxItem.type && <span className="text-sm font-medium bg-white/10 border border-white/20 text-white px-3 py-1 rounded-full">{lightboxItem.type}</span>}
                    </div>
                 </div>
             </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
