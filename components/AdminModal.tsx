
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Copy, Plus } from 'lucide-react';
import { PortfolioItem, MAJOR_CATEGORIES, WORK_TYPES, COLORS, HOLIDAYS, COLOR_HEX_MAP } from '../types';
import { safeUUID } from '../services/googleSheetsService';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: PortfolioItem | null;
  onSave: (items: PortfolioItem[]) => Promise<void>; // Modified to accept array
  onDelete: (id: string) => Promise<void>;
}

const YEARS = Array.from({length: 11}, (_, i) => (2020 + i).toString()); // 2020 to 2030
const MONTHS = Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0')); // 01 to 12

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, initialItem, onSave, onDelete }) => {
  // State is now an array of items. 
  // If editing, length is 1. If adding, length is batchSize.
  const [itemsData, setItemsData] = useState<PortfolioItem[]>([]);
  const [batchSize, setBatchSize] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialItem) {
      // Edit Mode: Just one item
      let formattedDate = initialItem.dateCreated || '';
      if (formattedDate.length > 7) formattedDate = formattedDate.substring(0, 7);
      setItemsData([{ ...initialItem, dateCreated: formattedDate }]);
      setBatchSize(1);
    } else {
      // Add Mode: Initialize with 1 default item
      initializeBatch(1);
    }
  }, [initialItem, isOpen]);

  const createDefaultItem = (): PortfolioItem => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return {
      id: safeUUID(),
      title: '', 
      description: '', 
      imageUrl: '',
      category: '', 
      majorCategory: MAJOR_CATEGORIES[0], 
      type: WORK_TYPES[0],
      color: '',
      holiday: '',
      link: '', 
      dateCreated: `${year}-${month}`
    };
  };

  const initializeBatch = (count: number) => {
    // If we already have items, try to keep their values (smart fill)
    // otherwise default
    const newItems: PortfolioItem[] = [];
    const template = itemsData.length > 0 ? itemsData[0] : createDefaultItem();

    for (let i = 0; i < count; i++) {
        if (i < itemsData.length) {
            newItems.push(itemsData[i]);
        } else {
            // Clone template but with new ID and empty Image URL
            newItems.push({
                ...template,
                id: safeUUID(),
                imageUrl: '' 
            });
        }
    }
    setItemsData(newItems);
    setBatchSize(count);
  };

  const handleBatchSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    initializeBatch(newSize);
  };

  const updateItemData = (index: number, field: keyof PortfolioItem, value: any) => {
    const newItems = [...itemsData];
    newItems[index] = { ...newItems[index], [field]: value };
    setItemsData(newItems);
  };

  const toggleColor = (index: number, color: string) => {
    const currentString = itemsData[index].color || '';
    const currentColors = currentString ? currentString.split(',').filter(Boolean) : [];
    
    let newColors;
    if (currentColors.includes(color)) {
      newColors = currentColors.filter(c => c !== color);
    } else {
      if (currentColors.length >= 3) {
        alert("顏色標籤最多只能選擇 3 個");
        return;
      }
      newColors = [...currentColors, color];
    }
    updateItemData(index, 'color', newColors.join(','));
  };

  const handleDateChange = (index: number, type: 'year' | 'month', value: string) => {
    const current = itemsData[index].dateCreated || '-';
    const [currYear, currMonth] = current.includes('-') ? current.split('-') : [YEARS[0], MONTHS[0]];
    const newYear = type === 'year' ? value : (currYear || YEARS[0]);
    const newMonth = type === 'month' ? value : (currMonth || MONTHS[0]);
    updateItemData(index, 'dateCreated', `${newYear}-${newMonth}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Filter out items with no Image URL to prevent junk data
    const validItems = itemsData.filter(i => i.imageUrl && i.imageUrl.trim() !== '');
    if (validItems.length === 0) {
        alert("請至少輸入一個有效的素材連結");
        setIsSaving(false);
        return;
    }
    
    try {
        await onSave(validItems);
        onClose();
    } catch (error) {
        console.error("Save error:", error);
        alert("儲存失敗！\n1. 請檢查您的網路連線。\n2. 您的 Google Apps Script 可能尚未更新至最新版本。\n請至後台「設定指南」複製新程式碼，並在 Apps Script 介面中選擇「管理部署」->「編輯」-> 版本選擇「新版本」後重新部署。");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (itemsData.length === 0) return;
    const idToDelete = itemsData[0].id;
    if (confirm('確定要刪除這個作品嗎？此動作無法復原。')) {
      try {
        setIsSaving(true);
        await onDelete(idToDelete);
        onClose();
      } catch (error) {
        console.error("Delete failed", error);
        alert("刪除失敗，請檢查 Apps Script 設定。");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const isVideo = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-none px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-bold text-gray-900">
               {initialItem ? '編輯作品' : '新增作品'}
             </h2>
             {!initialItem && (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                    <span className="text-sm font-bold text-gray-500">新增數量:</span>
                    <select 
                        className="bg-transparent font-bold text-indigo-600 outline-none cursor-pointer"
                        value={batchSize}
                        onChange={handleBatchSizeChange}
                    >
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>
             )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50">
           {itemsData.map((formData, index) => {
             const [selectedYear, selectedMonth] = (formData.dateCreated || '-').split('-');
             const currentColors = formData.color ? formData.color.split(',').filter(Boolean) : [];

             return (
               <div key={formData.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative transition-all hover:shadow-md">
                 {/* Item Index Badge for Batch Mode */}
                 {!initialItem && batchSize > 1 && (
                    <div className="absolute -top-3 -left-3 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">
                        {index + 1}
                    </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Asset URL - Full Width */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">素材連結 (Asset URL) <span className="text-red-500">*</span></label>
                        <input
                            required={index === 0} // Only first one mandatory for UX, validation handles rest
                            type="url"
                            placeholder="https://... (圖片或影片 .mp4)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white text-black"
                            value={formData.imageUrl}
                            onChange={e => updateItemData(index, 'imageUrl', e.target.value)}
                        />
                        {formData.imageUrl && (
                            <div className="mt-2 h-32 w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center relative">
                                {isVideo(formData.imageUrl) ? (
                                    <video src={formData.imageUrl} className="h-full w-full object-contain" controls muted />
                                ) : (
                                    <img 
                                        src={formData.imageUrl} 
                                        alt="Preview" 
                                        className="h-full object-contain" 
                                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Invalid+Asset')}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Major Category */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">大分類</label>
                        <select
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-black"
                            value={formData.majorCategory}
                            onChange={e => updateItemData(index, 'majorCategory', e.target.value)}
                        >
                            {MAJOR_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">類型</label>
                        <select
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-black"
                            value={formData.type}
                            onChange={e => updateItemData(index, 'type', e.target.value)}
                        >
                            {WORK_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">日期</label>
                        <div className="flex gap-2">
                            <select 
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none bg-white text-black"
                                value={selectedYear || ''}
                                onChange={(e) => handleDateChange(index, 'year', e.target.value)}
                            >
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <select 
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none bg-white text-black"
                                value={selectedMonth || ''}
                                onChange={(e) => handleDateChange(index, 'month', e.target.value)}
                            >
                                {MONTHS.map(m => <option key={m} value={m}>{m}月</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Holiday */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">節日</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none bg-white text-black"
                            value={formData.holiday}
                            onChange={e => updateItemData(index, 'holiday', e.target.value)}
                        >
                            <option value="">無</option>
                            {HOLIDAYS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>

                    {/* Colors */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">顏色 (最多3個)</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => {
                                const isSelected = currentColors.includes(c);
                                return (
                                    <button
                                        type="button"
                                        key={c}
                                        onClick={() => toggleColor(index, c)}
                                        className={`flex items-center px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${isSelected ? 'border-black ring-1 ring-black bg-gray-50' : 'border-gray-200 bg-white'}`}
                                    >
                                        <span className="w-3 h-3 rounded-full mr-2 border border-black/10" style={{ backgroundColor: COLOR_HEX_MAP[c] }}/>
                                        {c}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                 </div>
               </div>
             )
           })}
        </form>

        {/* Footer */}
        <div className="flex-none px-6 py-4 bg-white border-t border-gray-100 flex justify-between items-center rounded-b-2xl z-10">
           {initialItem ? (
                <button
                    type="button" 
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium cursor-pointer"
                >
                    <Trash2 size={16} className="mr-2" />
                    刪除
                </button>
            ) : <div />}
            
            <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex items-center px-8 py-3 bg-black text-white hover:bg-gray-800 rounded-xl shadow-lg transition-transform transform active:scale-95 text-sm font-bold cursor-pointer"
            >
                <Save size={18} className="mr-2" />
                {isSaving ? '處理中...' : `儲存 ${itemsData.length} 筆資料`}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
