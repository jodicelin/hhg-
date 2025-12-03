
import React, { useState, useMemo } from 'react';
import MasonryGrid from '../components/MasonryGrid';
import { PortfolioItem, MAJOR_CATEGORIES, WORK_TYPES, COLORS, HOLIDAYS, COLOR_HEX_MAP } from '../types';
import { Filter, XCircle, X, ArrowUpRight, Calendar, Layers, Tag, Hash, Moon, Sun } from 'lucide-react';

interface HomeProps {
  items: PortfolioItem[];
  isLoading: boolean;
  searchTerm: string;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Home: React.FC<HomeProps> = ({ items, isLoading, searchTerm, isDarkMode, toggleTheme }) => {
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
      const term = (searchTerm || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const major = (item.majorCategory || '').toLowerCase();

      const matchesSearch = !term || 
        title.includes(term) ||
        desc.includes(term) ||
        cat.includes(term) ||
        major.includes(term);

      const matchesCategory = selectedCategory === 'All' || item.majorCategory === selectedCategory;
      const matchesType = selectedType === 'All' || item.type === selectedType;
      const matchesColor = !selectedColor || (item.color || '').includes(selectedColor);
      const matchesHoliday = !selectedHoliday || item.holiday === selectedHoliday;

      return matchesSearch && matchesCategory && matchesType && matchesColor && matchesHoliday;
    });
  }, [items, searchTerm, selectedCategory, selectedType, selectedColor, selectedHoliday]);

  const handleTagClick = (type: 'color' | 'holiday' | 'majorCategory' | 'type', value: string) => {
    if (type === 'majorCategory') setSelectedCategory(value);
    if (type === 'type') setSelectedType(value);
    if (type === 'color') setSelectedColor(value);
    if (type === 'holiday') setSelectedHoliday(value);
    // Do NOT scroll to top, keep context
    setLightboxItem(null); 
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

  const formatDate = (item: PortfolioItem) => {
    if (item.date) {
        return item.date.replace('-', '.');
    }
    return '';
  };

  // Helper to determine layout class based on item type
  const getLightboxMediaClass = (item: PortfolioItem) => {
      const isVid = isVideo(item.imageUrl);
      const isEDM = item.type === 'EDM';

      // Video OR Non-EDM Images -> Center alignment, No Scroll (Fit to screen)
      if (isVid || !isEDM) {
          return "flex items-center justify-center overflow-hidden";
      }
      // EDM -> Scrollable, Top alignment
      return "overflow-y-auto block";
  };

  return (
    <main className="max-w-7xl mx-auto min-h-screen relative transition-colors duration-300">
      
      {/* Header Info - Visual Poetry Style */}
      <div className="px-4 sm:px-6 lg:px-8 pt-12 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-brand-black dark:text-white leading-[1.1] mb-4 transition-colors">
            HHG<br/>視覺靈感庫
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg max-w-md ml-1 transition-colors">
                歡迎來到 HHG 視覺旅程。<br/>
                探索動態瞬間的藝術性。
            </p>
        </div>
        
        {/* Decorative Stat Circle */}
        <div className="hidden md:flex items-center justify-center w-32 h-32 bg-brand-yellow rounded-full relative mb-2 shadow-xl shadow-brand-yellow/20">
             <div className="text-center text-brand-black">
                 <span className="block text-2xl font-black">{items.length}</span>
                 <span className="text-xs font-bold uppercase">作品數</span>
             </div>
             <div className="absolute top-0 right-0 bg-black dark:bg-white text-white dark:text-black p-2 rounded-full transform rotate-12 transition-colors">
                 <ArrowUpRight size={16}/>
             </div>
        </div>
      </div>

      {/* Sticky Filters */}
      <div className="sticky top-20 z-40 bg-brand-bg/95 dark:bg-brand-black/95 backdrop-blur-md pt-4 pb-6 transition-all border-b border-transparent dark:border-white/5">
        <div className="px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Level 1: Major Categories (Pill Tabs - Updated Style) */}
          <div className="flex flex-wrap gap-3">
            <button
                onClick={() => setSelectedCategory('All')}
                className={`px-6 py-3 rounded-full text-sm font-black tracking-wide transition-all transform active:scale-95 shadow-sm ${
                  selectedCategory === 'All' 
                    ? 'bg-brand-black text-white dark:bg-white dark:text-brand-black ring-2 ring-brand-black dark:ring-white' 
                    : 'bg-white dark:bg-brand-dark-card text-gray-400 dark:text-gray-500 hover:text-brand-black dark:hover:text-white hover:shadow-md'
                }`}
              >
                全部作品
              </button>
              {MAJOR_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-3 rounded-full text-sm font-black tracking-wide transition-all transform active:scale-95 shadow-sm border-0 ${
                    selectedCategory === cat 
                      ? 'bg-brand-yellow text-brand-black ring-2 ring-brand-yellow shadow-brand-yellow/30' 
                      : 'bg-white dark:bg-brand-dark-card text-gray-400 dark:text-gray-500 hover:text-brand-black dark:hover:text-white hover:shadow-md'
                  }`}
                >
                  {cat}
                </button>
              ))}
          </div>

          {/* Level 2: Secondary Filters */}
          <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center text-sm font-bold text-gray-400 dark:text-gray-500 mr-2 bg-white dark:bg-brand-dark-card px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800 transition-colors">
                  <Filter size={16} className="mr-2 text-brand-black dark:text-white"/> 篩選條件
                </div>

                <select 
                  className="px-4 py-2 text-sm font-bold bg-white dark:bg-brand-dark-card border-2 border-transparent text-gray-600 dark:text-gray-300 rounded-xl outline-none hover:border-gray-200 dark:hover:border-gray-700 focus:border-brand-yellow focus:text-black dark:focus:text-white transition-all cursor-pointer shadow-sm"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="All">類型 (全部)</option>
                  {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <select 
                  className="px-4 py-2 text-sm font-bold bg-white dark:bg-brand-dark-card border-2 border-transparent text-gray-600 dark:text-gray-300 rounded-xl outline-none hover:border-gray-200 dark:hover:border-gray-700 focus:border-brand-yellow focus:text-black dark:focus:text-white transition-all cursor-pointer shadow-sm"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                >
                  <option value="">顏色 (全部)</option>
                  {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select 
                  className="px-4 py-2 text-sm font-bold bg-white dark:bg-brand-dark-card border-2 border-transparent text-gray-600 dark:text-gray-300 rounded-xl outline-none hover:border-gray-200 dark:hover:border-gray-700 focus:border-brand-yellow focus:text-black dark:focus:text-white transition-all cursor-pointer shadow-sm"
                  value={selectedHoliday}
                  onChange={(e) => setSelectedHoliday(e.target.value)}
                >
                  <option value="">節日 (全部)</option>
                  {HOLIDAYS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    className="ml-auto md:ml-2 flex items-center px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"
                  >
                    <XCircle size={14} className="mr-1"/> 清除篩選
                  </button>
                )}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="py-4 pb-20">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-brand-yellow"></div>
          </div>
        ) : (
          <MasonryGrid 
            items={filteredItems} 
            onTagClick={handleTagClick} 
            onItemClick={(item) => setLightboxItem(item)}
          />
        )}
      </div>

      {/* Theme Toggle Button (Bottom Left) */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-6 left-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group bg-brand-black dark:bg-white text-white dark:text-brand-black"
        title="切換主題"
      >
         {isDarkMode ? <Sun size={24} className="group-hover:rotate-90 transition-transform"/> : <Moon size={24} className="group-hover:-rotate-12 transition-transform"/>}
      </button>

      {/* Modern Split-View Lightbox */}
      {lightboxItem && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in"
          onClick={() => setLightboxItem(null)}
        >
          {/* 1. Blurred Background Layer */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
             {isVideo(lightboxItem.imageUrl) ? (
                <video 
                    src={`${lightboxItem.imageUrl}#t=0.001`}
                    className="absolute inset-0 w-full h-full object-cover blur-3xl scale-110 opacity-60"
                    autoPlay muted loop playsInline preload="metadata"
                />
             ) : (
                 <div 
                    className="absolute inset-0 bg-cover bg-center blur-3xl scale-110 opacity-60"
                    style={{ backgroundImage: `url(${lightboxItem.imageUrl})` }}
                 />
             )}
             {/* White/Glass overlay - 40% opacity (Light) / Dark overlay (Dark) */}
             <div className="absolute inset-0 bg-white/40 dark:bg-black/60 backdrop-blur-xl transition-colors" />
          </div>

          {/* 2. Main Card Container */}
          <div 
            className="relative z-10 w-full max-w-7xl h-[85vh] md:h-[90vh] bg-white dark:bg-brand-dark-card rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/50 dark:border-white/10 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
             {/* Close Button (Floating) */}
             <button 
                onClick={() => setLightboxItem(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-[20] bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-black dark:text-white p-3 rounded-full backdrop-blur-md transition-all hover:rotate-90 shadow-sm border border-black/5 dark:border-white/10"
             >
                <X size={24} />
             </button>

             {/* Left Column: Media (65%) */}
             <div className={`w-full md:w-[65%] h-[40vh] md:h-full bg-gray-50/50 dark:bg-black/20 relative ${getLightboxMediaClass(lightboxItem)}`}>
                {isVideo(lightboxItem.imageUrl) ? (
                    <div className="w-full h-full flex items-center justify-center p-4 md:p-10">
                        <video 
                            src={`${lightboxItem.imageUrl}#t=0.001`} 
                            className="max-w-full max-h-full rounded-2xl shadow-sm outline-none object-contain" 
                            controls 
                            autoPlay 
                            preload="metadata"
                        />
                    </div>
                ) : (
                    <img 
                      src={lightboxItem.imageUrl} 
                      alt={lightboxItem.title} 
                      className={lightboxItem.type === 'EDM' ? "w-full h-auto min-h-full object-cover" : "max-w-full max-h-full object-contain p-4 md:p-10"}
                    />
                )}
             </div>

             {/* Right Column: Info (35%) */}
             <div className="w-full md:w-[35%] h-full bg-white dark:bg-brand-dark-card flex flex-col overflow-y-auto transition-colors">
                <div className="p-8 md:p-12 space-y-8">
                    
                    {/* Header: Date & Title */}
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 font-bold text-sm mb-3">
                            <Calendar size={16} />
                            <span>{formatDate(lightboxItem)}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-brand-black dark:text-white leading-[1.1] tracking-tight transition-colors">
                            {lightboxItem.title || '未命名作品'}
                        </h2>
                    </div>

                    <div className="w-full h-px bg-gray-100 dark:bg-gray-700 transition-colors" />

                    {/* Tags Section */}
                    <div className="space-y-6">
                        
                        {/* Major Category */}
                        {lightboxItem.majorCategory && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <Layers size={12}/> 大分類
                                </h3>
                                <button 
                                    onClick={() => handleTagClick('majorCategory', lightboxItem.majorCategory!)}
                                    className="text-sm font-bold bg-brand-black dark:bg-white text-white dark:text-brand-black px-4 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    {lightboxItem.majorCategory}
                                </button>
                            </div>
                        )}

                        {/* Type */}
                        {lightboxItem.type && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <Tag size={12}/> 類型
                                </h3>
                                <button 
                                    onClick={() => handleTagClick('type', lightboxItem.type!)}
                                    className="text-sm font-bold bg-brand-yellow text-brand-black px-4 py-2 rounded-full hover:brightness-110 transition-all active:scale-95 shadow-sm shadow-brand-yellow/20"
                                >
                                    {lightboxItem.type}
                                </button>
                            </div>
                        )}

                        {/* Holiday */}
                        {lightboxItem.holiday && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <Hash size={12}/> 節日
                                </h3>
                                <button 
                                    onClick={() => handleTagClick('holiday', lightboxItem.holiday!)}
                                    className="text-sm font-bold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/30 text-brand-black dark:text-white px-4 py-2 rounded-full hover:bg-white dark:hover:bg-brand-dark-card hover:border-brand-black dark:hover:border-white transition-all active:scale-95"
                                >
                                    {lightboxItem.holiday}
                                </button>
                            </div>
                        )}

                        {/* Colors */}
                        {lightboxItem.color && (
                             <div className="space-y-2">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">色系</h3>
                                <div className="flex flex-wrap gap-2">
                                    {lightboxItem.color.split(',').filter(Boolean).map(c => (
                                        <button
                                            key={c}
                                            onClick={() => handleTagClick('color', c)}
                                            className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-colors bg-white dark:bg-brand-dark-card shadow-sm"
                                        >
                                            <span 
                                                className="w-4 h-4 rounded-full border border-black/5" 
                                                style={{ backgroundColor: COLOR_HEX_MAP[c] || '#e5e7eb' }}
                                            />
                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white">{c}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Description (If exists in future) */}
                    {lightboxItem.description && (
                        <>
                             <div className="w-full h-px bg-gray-100 dark:bg-gray-700" />
                             <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                 {lightboxItem.description}
                             </p>
                        </>
                    )}

                </div>
             </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
