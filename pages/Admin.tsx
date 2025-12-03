import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Sheet, HelpCircle, Check, LogOut, Database, Copy, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { PortfolioItem } from '../types';
import AdminModal from '../components/AdminModal';
import { createItem, createBatchItems, updateItem, deleteItem, getSheetUrl, setSheetUrl, GOOGLE_APPS_SCRIPT_CODE } from '../services/googleSheetsService';

interface AdminProps {
  items: PortfolioItem[];
  refreshData: () => void;
  onLogout: () => void;
}

const ITEMS_PER_PAGE = 10;

const Admin: React.FC<AdminProps> = ({ items, refreshData, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [sheetUrlInput, setSheetUrlInput] = useState(getSheetUrl());
  const [showSheetHelp, setShowSheetHelp] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [copyStatus, setCopyStatus] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination Logic
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  }, [items, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of list smoothly
      document.getElementById('admin-list-top')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEdit = (item: PortfolioItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleSaveItems = async (itemsToSave: PortfolioItem[]) => {
    if (selectedItem && itemsToSave.length === 1) {
      await updateItem(itemsToSave[0]);
    } else {
      if (itemsToSave.length === 1) {
        await createItem(itemsToSave[0]);
      } else if (itemsToSave.length > 1) {
        await createBatchItems(itemsToSave);
      }
    }
    refreshData();
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id);
    refreshData();
  };

  const saveSettings = () => {
    setSheetUrl(sheetUrlInput);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
    refreshData();
  };

  const copyScriptCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const isVideo = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 min-h-screen font-sans transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-gray-200 dark:border-gray-700 pb-8">
        <div>
          <h1 className="text-4xl font-black text-brand-black dark:text-white tracking-tight mb-2 transition-colors">後台管理儀表板</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">管理您的作品集資料庫。</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            <button 
                onClick={onLogout}
                className="flex-1 md:flex-none justify-center flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-brand-dark-card border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                <LogOut size={16} />
                登出
            </button>
            <button 
                onClick={handleAddNew}
                className="flex-1 md:flex-none justify-center flex items-center px-6 py-3 bg-brand-yellow text-brand-black text-sm font-bold rounded-xl hover:brightness-110 shadow-md transition-all active:scale-95"
            >
                <Plus size={18} className="mr-2" />
                新增作品
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Settings */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-brand-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 transition-colors">
                <div className="flex items-center gap-3 mb-6 text-brand-black dark:text-white">
                    <div className="p-2 bg-brand-yellow rounded-lg">
                        <Database size={20} className="text-brand-black"/>
                    </div>
                    <h2 className="font-bold text-lg">資料庫設定</h2>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium leading-relaxed transition-colors">
                    連結 Google Sheets 以儲存資料。
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                            Web App URL
                        </label>
                        <input 
                            type="text" 
                            placeholder="https://script.google.com/..." 
                            className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-brand-yellow/20 focus:border-brand-yellow outline-none bg-gray-50 dark:bg-black/30 text-brand-black dark:text-white transition-all font-medium"
                            value={sheetUrlInput}
                            onChange={(e) => setSheetUrlInput(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={saveSettings}
                        className={`w-full flex items-center justify-center px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                            saveStatus === 'saved' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-brand-black dark:bg-white text-white dark:text-brand-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-sm'
                        }`}
                    >
                        {saveStatus === 'saved' ? (
                            <><Check size={16} className="mr-2"/> 已儲存</>
                        ) : '儲存連結'}
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                     <button 
                        onClick={() => setShowSheetHelp(!showSheetHelp)}
                        className="w-full flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-bold group"
                    >
                        <span className="flex items-center gap-2"><HelpCircle size={16} /> 設定指南</span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                            {showSheetHelp ? '隱藏' : '顯示'}
                        </span>
                    </button>

                    {showSheetHelp && (
                        <div className="mt-4 text-xs text-gray-600 dark:text-gray-300 space-y-4 bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors">
                            <p className="leading-5">
                                <strong className="text-red-500">1. 修改試算表標題 (剩7欄):</strong><br/>
                                <span className="text-gray-400 block mb-1">請務必刪除舊欄位，確保順序如下：</span>
                                <code className="text-brand-black dark:text-white font-bold bg-white dark:bg-black/50 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 break-all block">
                                    A: id<br/>
                                    B: imageUrl<br/>
                                    C: majorCategory<br/>
                                    D: type<br/>
                                    <span className="text-brand-yellow">E: date</span> (YYYY-MM)<br/>
                                    <span className="text-brand-yellow">F: holiday</span><br/>
                                    <span className="text-brand-yellow">G: color</span>
                                </code>
                            </p>
                            
                            <div>
                              <strong>2. 更新 Apps Script (v13)</strong><br/>
                              <span className="text-gray-400 mb-2 block">複製並貼上到 擴充功能 &gt; Apps Script。</span>
                              <span className="text-gray-400 text-[10px] block mb-2">可使用上方的 `test` 函式來測試權限。</span>
                              <button 
                                onClick={copyScriptCode}
                                className={`w-full flex justify-center items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${copyStatus ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white dark:bg-black/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                              >
                                {copyStatus ? <Check size={14}/> : <Copy size={14}/>}
                                {copyStatus ? '已複製!' : '複製程式碼'}
                              </button>
                            </div>

                            <p className="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900/30">
                                <strong className="flex items-center gap-1 text-red-600 dark:text-red-400"><AlertTriangle size={12}/> 3. 重新部署 (重要!)</strong>
                                <span className="block mt-1">新增部署 &gt; 網頁應用程式。<br/>版本: <strong className="underline text-red-600 dark:text-red-400">新版本 (New Version)</strong>。<br/>誰可以存取: <strong>任何人 (Anyone)</strong>。</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Content List */}
        <div className="lg:col-span-2">
            <div className="bg-white dark:bg-brand-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors flex flex-col min-h-[600px]">
                <div id="admin-list-top" className="px-8 py-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-brand-dark-card flex justify-between items-center">
                    <h3 className="font-bold text-brand-black dark:text-white text-lg">作品列表</h3>
                    <span className="text-xs font-bold text-brand-black bg-brand-yellow px-3 py-1 rounded-full">{items.length} 總數</span>
                </div>
                
                <div className="flex-1 divide-y divide-gray-100 dark:divide-gray-700">
                    {currentItems.map(item => (
                        <div key={item.id} className="p-6 flex gap-5 items-center hover:bg-[#FFBD59]/5 dark:hover:bg-[#FFBD59]/10 transition-colors group">
                            <div className="w-20 h-20 flex-shrink-0 bg-gray-100 dark:bg-black/30 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative">
                                {isVideo(item.imageUrl) ? (
                                    <video 
                                        src={`${item.imageUrl}#t=0.001`} 
                                        className="w-full h-full object-cover" 
                                        muted 
                                        preload="metadata"
                                    />
                                ) : (
                                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <h4 className="font-bold text-gray-400 dark:text-gray-500 italic text-sm">
                                      未命名作品
                                    </h4>
                                    
                                    {item.majorCategory && (
                                      <span className="text-[10px] uppercase tracking-wider font-bold text-white bg-brand-black dark:bg-white dark:text-black px-2 py-0.5 rounded-md">
                                          {item.majorCategory}
                                      </span>
                                    )}
                                     {item.type && (
                                      <span className="text-[10px] uppercase tracking-wider font-bold text-brand-black bg-brand-yellow px-2 py-0.5 rounded-md">
                                          {item.type}
                                      </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                  {item.date}
                                </p>
                            </div>

                            <button 
                                onClick={() => handleEdit(item)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-brand-black dark:text-white bg-white dark:bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg hover:border-black dark:hover:border-white transition-all shadow-sm"
                            >
                                <Edit2 size={16} />
                                <span className="hidden sm:inline">編輯</span>
                            </button>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="p-16 text-center">
                            <div className="inline-flex p-6 bg-gray-50 dark:bg-black/20 rounded-full text-gray-300 dark:text-gray-600 mb-4">
                                <Sheet size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">目前沒有作品</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">開始建立您的收藏。</p>
                            <button onClick={handleAddNew} className="text-brand-black dark:text-white border-b-2 border-brand-yellow hover:bg-brand-yellow hover:border-transparent px-1 transition-colors font-bold text-sm pb-0.5">
                                新增第一個作品
                            </button>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-brand-dark-card flex justify-center items-center gap-4">
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)} 
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-brand-black dark:text-white border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        
                        <div className="flex items-center gap-2">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Simple logic to show a window of pages or just first 5 for now
                                // For a full implementation, would need complex sliding window logic
                                // Here we keep it simple: if pages < 7 show all, else show sliding window
                                
                                let p = i + 1;
                                if (totalPages > 5) {
                                    if (currentPage > 3) p = currentPage - 2 + i;
                                    if (p > totalPages) p = totalPages - (4 - i);
                                }
                                
                                return (
                                    <button
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                                            currentPage === p 
                                            ? 'bg-brand-black dark:bg-white text-white dark:text-brand-black shadow-md' 
                                            : 'text-gray-500 hover:bg-white dark:hover:bg-gray-700 hover:text-black dark:hover:text-white'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>

                        <button 
                            onClick={() => handlePageChange(currentPage + 1)} 
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-brand-black dark:text-white border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      <AdminModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialItem={selectedItem}
        onSave={handleSaveItems}
        onDelete={handleDeleteItem}
      />
    </div>
  );
};

export default Admin;