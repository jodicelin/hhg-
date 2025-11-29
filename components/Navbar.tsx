import React from 'react';
import { Search, LayoutGrid, Lock } from 'lucide-react';

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAdminClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchTerm, setSearchTerm, onAdminClick }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.hash = ''}>
            <div className="bg-black text-white p-1.5 rounded-lg">
              <LayoutGrid size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">HHG</span>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent sm:text-sm transition-all"
                placeholder="搜尋作品、關鍵字..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Admin Link */}
          <button 
            onClick={onAdminClick}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            <Lock size={16} />
            <span className="hidden sm:inline">後台管理</span>
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
           <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-black sm:text-sm"
                placeholder="搜尋..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;