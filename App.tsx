
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { PortfolioItem } from './types';
import { fetchItems } from './services/googleSheetsService';
import { LayoutGrid, Lock, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'admin' | 'login'>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [password, setPassword] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchItems();
    setItems(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    // Check hash for simple routing
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setView('login');
      } else {
        setView('home');
      }
    };
    
    // Initial check
    if (window.location.hash === '#admin') {
       handleHashChange();
    } else {
       // Force default to home
       setView('home');
       // Clear hash in case it was lingering but we want to default to home
       if (window.location.hash) {
          window.history.replaceState(null, '', ' ');
       }
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded password for demo purposes
    if (password === 'admin123') {
      setView('admin');
      setLoginError('');
      setPassword('');
    } else {
      setLoginError('密碼錯誤');
      // Intentionally NOT clearing password so user can edit it
    }
  };

  const onAdminLogout = () => {
    window.location.hash = '';
    setView('home');
  };

  const navigateToHome = () => {
      window.location.hash = '';
      setView('home');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900">
      {view === 'home' && (
        <>
          <Navbar 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            onAdminClick={() => window.location.hash = 'admin'}
          />
          <Home items={items} isLoading={isLoading} searchTerm={searchTerm} />
        </>
      )}

      {view === 'login' && (
         <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 animate-fade-in">
             <div className="w-full max-w-lg space-y-8">
                 
                 {/* Header */}
                 <div className="text-center">
                    <div className="inline-flex bg-black text-white p-3 rounded-xl mb-4 shadow-lg">
                        <LayoutGrid size={32} />
                    </div>
                    <h2 className="text-3xl font-light text-gray-900 tracking-tight mb-2">HHG 視覺靈感庫</h2>
                    <p className="text-gray-500">請選擇您的目的地</p>
                 </div>

                 {/* Option 1: Go to Home (Emphasized) */}
                 <button 
                    onClick={navigateToHome}
                    className="w-full group relative bg-orange-600 hover:bg-orange-700 text-white rounded-2xl p-6 shadow-xl transition-all transform hover:-translate-y-1"
                 >
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <h3 className="text-xl font-bold mb-1">進入作品主頁</h3>
                            <p className="text-orange-100 text-sm">瀏覽所有設計作品與靈感</p>
                        </div>
                        <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                            <ArrowRight size={24} />
                        </div>
                    </div>
                 </button>

                 {/* Option 2: Admin Login */}
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                     <div className="flex items-center gap-2 mb-6 text-gray-900">
                         <Lock size={20} className="text-gray-400"/>
                         <h3 className="font-bold text-lg">後台管理登入</h3>
                     </div>
                     
                     <form onSubmit={handleLogin} className="space-y-4">
                         <div>
                             <input 
                                type="password" 
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-gray-50 text-gray-900 placeholder-gray-400 transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="請輸入管理員密碼"
                                autoFocus
                             />
                         </div>
                         {loginError && <p className="text-red-500 text-sm font-medium flex items-center gap-1"><span className="block w-1.5 h-1.5 rounded-full bg-red-500"></span>{loginError}</p>}
                         
                         <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors">
                             登入系統
                         </button>
                     </form>
                 </div>

             </div>
         </div>
      )}

      {view === 'admin' && (
        <Admin 
          items={items} 
          refreshData={loadData} 
          onLogout={onAdminLogout}
        />
      )}
    </div>
  );
};

export default App;
