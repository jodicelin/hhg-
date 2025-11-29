import React, { useState } from 'react';
import { Plus, Edit2, Sheet, HelpCircle, Check, LogOut, Database, Copy } from 'lucide-react';
import { PortfolioItem } from '../types';
import AdminModal from '../components/AdminModal';
import { createItem, updateItem, deleteItem, getSheetUrl, setSheetUrl, GOOGLE_APPS_SCRIPT_CODE } from '../services/googleSheetsService';

interface AdminProps {
  items: PortfolioItem[];
  refreshData: () => void;
  onLogout: () => void;
}

const Admin: React.FC<AdminProps> = ({ items, refreshData, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [sheetUrlInput, setSheetUrlInput] = useState(getSheetUrl());
  const [showSheetHelp, setShowSheetHelp] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [copyStatus, setCopyStatus] = useState(false);

  const handleEdit = (item: PortfolioItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (item: PortfolioItem) => {
    // Optimistic refresh happens inside service, but we trigger a UI reload here too
    if (selectedItem) {
      await updateItem(item);
    } else {
      await createItem(item);
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
    // Attempt to fetch immediately to verify
    refreshData();
  };

  const copyScriptCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">後台管理系統</h1>
          <p className="text-gray-500 mt-1">管理您的設計作品與資料庫連結。</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <button 
                onClick={onLogout}
                className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 border border-gray-200 rounded-lg hover:bg-red-50 transition-colors"
            >
                <LogOut size={16} />
                登出
            </button>
            <button 
                onClick={handleAddNew}
                className="flex-1 md:flex-none justify-center flex items-center px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 shadow-md transition-all active:scale-95"
            >
                <Plus size={18} className="mr-2" />
                新增作品
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Settings */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4 text-gray-900">
                    <Database size={20} className="text-indigo-600"/>
                    <h2 className="font-bold">Google Sheets 設定</h2>
                </div>
                
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                    連結 Google 試算表以永久儲存資料。
                </p>

                <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase">
                        Web App URL (網頁應用程式網址)
                    </label>
                    <input 
                        type="text" 
                        placeholder="https://script.google.com/..." 
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                        value={sheetUrlInput}
                        onChange={(e) => setSheetUrlInput(e.target.value)}
                    />
                    
                    <button 
                        onClick={saveSettings}
                        className={`w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                            saveStatus === 'saved' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                        }`}
                    >
                        {saveStatus === 'saved' ? (
                            <><Check size={16} className="mr-2"/> 已儲存</>
                        ) : '儲存連結'}
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                     <button 
                        onClick={() => setShowSheetHelp(!showSheetHelp)}
                        className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-black font-medium group"
                    >
                        <span className="flex items-center gap-2"><HelpCircle size={16} /> 設定指南</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded group-hover:bg-gray-200 transition-colors">
                            {showSheetHelp ? '隱藏' : '顯示'}
                        </span>
                    </button>

                    {showSheetHelp && (
                        <div className="mt-4 text-xs text-gray-600 space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="leading-5">
                                <strong>1. 建立試算表標題 (第一列):</strong><br/>
                                <code className="text-indigo-600 bg-indigo-50 px-1 break-all">id, title, description, imageUrl, category, link, dateCreated, majorCategory, type, color, holiday</code>
                                <br/><span className="text-[10px] text-gray-400">(共 11 欄)</span>
                            </p>
                            
                            <div>
                              <strong>2. Apps Script 程式碼</strong><br/>
                              <span className="text-gray-500 mb-1 block">點擊下方按鈕複製，並貼上至 擴充功能 &gt; Apps Script。</span>
                              <button 
                                onClick={copyScriptCode}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${copyStatus ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                              >
                                {copyStatus ? <Check size={12}/> : <Copy size={12}/>}
                                {copyStatus ? '已複製!' : '複製程式碼'}
                              </button>
                            </div>

                            <p><strong>3. 部署 (Deploy)</strong><br/>部署 &gt; 新增部署 &gt; 網頁應用程式。<br/>誰可以存取: <strong>任何人 (Anyone)</strong>。</p>
                            <p><strong>4. 貼上網址</strong><br/>將產生的 Web App URL 貼到上方欄位。</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Content List */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">作品列表</h3>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{items.length} 筆</span>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {items.map(item => (
                        <div key={item.id} className="p-4 flex gap-4 items-center hover:bg-gray-50 transition-colors group">
                            <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="font-bold text-gray-900 truncate mr-2">{item.title}</h4>
                                    {item.majorCategory && (
                                      <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                                          {item.majorCategory}
                                      </span>
                                    )}
                                     {item.type && (
                                      <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                          {item.type}
                                      </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 truncate">{item.description}</p>
                            </div>

                            <button 
                                onClick={() => handleEdit(item)}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-black hover:text-black transition-all shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                                <Edit2 size={14} />
                                <span className="hidden sm:inline">編輯</span>
                            </button>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="inline-flex p-4 bg-gray-50 rounded-full text-gray-300 mb-3">
                                <Sheet size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">尚無作品</h3>
                            <p className="text-gray-500 mb-6">新增您的第一個設計作品。</p>
                            <button onClick={handleAddNew} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                                立即新增
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      <AdminModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialItem={selectedItem}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />
    </div>
  );
};

export default Admin;