
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { PortfolioItem } from './types';
import { fetchItems } from './services/googleSheetsService';

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
    
    window.addEventListener('hashchange', handleHashChange);
    // Only check hash if it's explicitly set to something that isn't empty
    // This ensures default load (empty hash) is Home
    if (window.location.hash === '#admin') {
       handleHashChange();
    } else {
       // Explicitly set home for any other case or empty hash
       setView('home');
       // Clean up hash if it was something weird
       if(window.location.hash !== '') {
          history.replaceState(null, '', ' ');
       }
    }

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
    }
  };

  const onAdminLogout = () => {
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
         <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100 animate-fade-in">
             <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
                 <h2 className="text-2xl font-bold mb-6 text-center text-white">後台登入</h2>
                 <form onSubmit={handleLogin} className="space-y-4">
                     <div>
                         <label className="block text-sm font-medium text-gray-300 mb-1">密碼</label>
                         <input 
                            type="password" 
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-900"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="請輸入密碼"
                         />
                     </div>
                     {loginError && <p className="text-red-400 text-sm font-medium">{loginError}</p>}
                     <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700 transition-colors shadow-lg">
                         進入管理介面
                     </button>
                     <button 
                        type="button"
                        onClick={onAdminLogout}
                        className="w-full text-gray-400 text-sm hover:text-white hover:underline mt-2 transition-colors"
                     >
                        返回首頁
                     </button>
                 </form>
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
