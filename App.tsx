import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Team from './pages/Team';
import { PortfolioItem } from './types';
import { fetchItems } from './services/googleSheetsService';
import { LayoutGrid, Lock, ArrowUpRight } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'admin' | 'login' | 'team'>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [password, setPassword] = useState('');
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchItems();
    setItems(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    
    // Theme Initialization
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Routing Logic
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setView('login');
      } else if (hash === '#team') {
        setView('team');
      } else {
        setView('home');
      }
    };
    
    if (window.location.hash === '#admin') {
       setView('login');
    } else if (window.location.hash === '#team') {
       setView('team');
    } else {
       setView('home');
       if (window.location.hash) {
          window.history.replaceState(null, '', ' ');
       }
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
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

  const navigateToHome = () => {
      window.location.hash = '';
      setView('home');
  };

  return (
    <div className="min-h-screen font-sans transition-colors duration-300">
      {(view === 'home' || view === 'team') && (
        <>
          <Navbar 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            onAdminClick={() => window.location.hash = 'admin'}
            onHomeClick={() => window.location.hash = ''}
            onTeamClick={() => window.location.hash = 'team'}
            currentView={view}
          />
          {view === 'home' && (
            <Home 
              items={items} 
              isLoading={isLoading} 
              searchTerm={searchTerm} 
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
            />
          )}
          {view === 'team' && <Team />}
        </>
      )}

      {view === 'login' && (
         <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-brand-bg dark:bg-brand-black animate-fade-in relative overflow-hidden transition-colors">
             
             {/* Decorative Background blob */}
             <div className="absolute top-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-brand-yellow rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
             
             <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
                 
                 {/* Left Side: Branding */}
                 <div className="text-left space-y-6">
                    <div className="inline-flex bg-brand-black dark:bg-white text-white dark:text-brand-black p-4 rounded-2xl shadow-xl transition-colors">
                        <LayoutGrid size={40} />
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] text-brand-black dark:text-white transition-colors">
                        HHG<br/>
                        視覺靈感庫
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xs transition-colors">
                        HHG 視覺靈感庫。<br/>探索跨越時間與空間的創意旅程。
                    </p>
                 </div>

                 {/* Right Side: Actions */}
                 <div className="space-y-6 flex flex-col justify-center">
                    {/* Option 1: Go to Home */}
                    <button 
                        onClick={navigateToHome}
                        className="w-full group relative bg-brand-yellow text-brand-black rounded-[2rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border-2 border-transparent hover:border-brand-black/10"
                    >
                        <div className="relative z-10 flex flex-col items-start h-full justify-between min-h-[160px]">
                            <div className="bg-white/20 p-3 rounded-full mb-4">
                                <LayoutGrid size={24} className="text-black"/>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black mb-1">進入作品主頁</h3>
                                <p className="text-black/70 font-medium">Browse Collection</p>
                            </div>
                            <div className="absolute top-6 right-6 bg-black text-white p-3 rounded-full group-hover:rotate-45 transition-transform duration-300">
                                <ArrowUpRight size={24} />
                            </div>
                        </div>
                        {/* Blob decoration */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
                    </button>

                    {/* Option 2: Admin Login */}
                    <div className="bg-white dark:bg-brand-dark-card rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8 transition-colors">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full transition-colors">
                                <Lock size={16} className="text-gray-500 dark:text-gray-400"/>
                            </div>
                            <h3 className="font-bold text-lg text-brand-black dark:text-white">後台管理</h3>
                        </div>
                        
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <input 
                                    type="password" 
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none text-brand-black dark:text-white placeholder-gray-400 font-medium transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="輸入密碼..."
                                />
                            </div>
                            {loginError && <p className="text-red-500 text-sm font-bold ml-1">{loginError}</p>}
                            
                            <button type="submit" className="w-full bg-brand-black text-white dark:bg-white dark:text-brand-black py-4 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                                登入 Log In
                            </button>
                        </form>
                    </div>
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