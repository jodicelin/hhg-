import React from 'react';
import { Search, LayoutGrid, Lock, Users } from 'lucide-react';

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAdminClick: () => void;
  onHomeClick: () => void;
  onTeamClick: () => void;
  currentView: string;
}

const Navbar: React.FC<NavbarProps> = ({ searchTerm, setSearchTerm, onAdminClick, onHomeClick, onTeamClick, currentView }) => {
  return (
    <nav className="sticky top-0 z-50 bg-brand-bg/90 dark:bg-brand-black/90 backdrop-blur-md transition-colors border-b border-gray-100/50 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-2 cursor-pointer group flex-shrink-0" onClick={onHomeClick}>
            <div className="bg-brand-black dark:bg-white text-white dark:text-brand-black p-2 rounded-xl group-hover:rotate-12 transition-all duration-300">
              <LayoutGrid size={24} />
            </div>
            <span className="font-black text-2xl tracking-tighter text-brand-black dark:text-white hidden sm:block transition-colors">HHG</span>
          </div>

          {/* Center: Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 justify-center max-w-2xl px-8">
            {currentView === 'home' && (
                <div className="relative w-full group transition-all">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-brand-yellow transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-brand-dark-card rounded-full leading-5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-yellow dark:focus:border-brand-yellow focus:ring-4 focus:ring-brand-yellow/10 sm:text-sm transition-all font-medium shadow-sm"
                        placeholder="搜尋作品..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Admin Link */}
            <button 
                onClick={onAdminClick}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-brand-dark-card border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-brand-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all shadow-sm group relative"
                title="後台管理"
            >
                <Lock size={18} />
                <span className="absolute -bottom-8 bg-black dark:bg-white text-white dark:text-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">後台</span>
            </button>

            {/* Team Link - Moved to the right of Admin */}
            <button 
                onClick={onTeamClick}
                className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all shadow-sm group relative ${currentView === 'team' ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black border-brand-black dark:border-white' : 'bg-white dark:bg-brand-dark-card border-gray-200 dark:border-gray-700 text-gray-400 hover:text-brand-black dark:hover:text-white hover:border-black dark:hover:border-white'}`}
                title="成員介紹"
            >
                <Users size={18} />
                 <span className="absolute -bottom-8 bg-black dark:bg-white text-white dark:text-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">成員</span>
            </button>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden pb-4 space-y-3">
           {/* Mobile Search (If home) */}
           {currentView === 'home' && (
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-2.5 border-none rounded-xl leading-5 bg-white dark:bg-brand-dark-card text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow sm:text-sm font-medium shadow-sm"
                        placeholder="搜尋作品..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
           )}
           {/* Mobile Menu Buttons */}
           <div className="flex gap-2">
                <button 
                    onClick={onHomeClick}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${currentView === 'home' ? 'bg-brand-black text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-brand-dark-card text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800'}`}
                >
                    作品列表
                </button>
                <button 
                    onClick={onTeamClick}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${currentView === 'team' ? 'bg-brand-black text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-brand-dark-card text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800'}`}
                >
                    成員介紹
                </button>
           </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;