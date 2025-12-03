import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { PortfolioItem, MAJOR_CATEGORIES, WORK_TYPES, COLORS, HOLIDAYS, COLOR_HEX_MAP } from '../types';
import { safeUUID } from '../services/googleSheetsService';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: PortfolioItem | null;
  onSave: (items: PortfolioItem[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

// Temporary interface for form handling since we are splitting date in UI
interface FormData extends Omit<PortfolioItem, 'date'> {
    year: string;
    mon: string;
}

const YEARS = Array.from({length: 11}, (_, i) => (2020 + i).toString());
const MONTHS = Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0'));

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, initialItem, onSave, onDelete }) => {
  const [itemsData, setItemsData] = useState<FormData[]>([]);
  const [batchSize, setBatchSize] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialItem) {
      // Edit Mode
      const parts = (initialItem.date || '').split('-');
      const y = parts[0] || YEARS[0];
      const m = parts[1] || MONTHS[0];

      setItemsData([{ 
          ...initialItem, 
          title: initialItem.title || '',
          description: initialItem.description || '',
          category: initialItem.category || '',
          majorCategory: initialItem.majorCategory || MAJOR_CATEGORIES[0],
          type: initialItem.type || WORK_TYPES[0],
          holiday: initialItem.holiday || '', 
          color: initialItem.color || '',     
          link: initialItem.link || '',
          year: y,
          mon: m
      }]);
      setBatchSize(1);
    } else {
      // Add Mode
      if (isOpen) {
          initializeBatch(1);
      }
    }
  }, [initialItem, isOpen]);

  const createDefaultItem = (): FormData => {
    // STICKY DATE LOGIC
    const savedYear = localStorage.getItem('sticky_year');
    const savedMon = localStorage.getItem('sticky_mon');

    const now = new Date();
    const currentYear = String(now.getFullYear());
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    
    // Prioritize saved sticky date
    const defaultYear = savedYear && YEARS.includes(savedYear) ? savedYear : currentYear;
    const defaultMon = savedMon && MONTHS.includes(savedMon) ? savedMon : currentMonth;

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
      year: defaultYear,
      mon: defaultMon
    };
  };

  const initializeBatch = (count: number) => {
    const newItems: FormData[] = [];
    const template = itemsData.length > 0 ? itemsData[0] : createDefaultItem();

    for (let i = 0; i < count; i++) {
        if (i < itemsData.length) {
            newItems.push(itemsData[i]);
        } else {
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

  const updateItemData = (index: number, field: keyof FormData, value: any) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Save Sticky Date Preference
    if (itemsData.length > 0) {
        const firstItem = itemsData[0];
        if (firstItem.year && firstItem.mon) {
            localStorage.setItem('sticky_year', firstItem.year);
            localStorage.setItem('sticky_mon', firstItem.mon);
        }
    }

    const validItems: PortfolioItem[] = itemsData
        .filter(i => i.imageUrl && i.imageUrl.trim() !== '')
        .map(i => {
            const y = i.year || '2024';
            const m = i.mon || '01';
            const dateStr = `${y}-${m}`;

            // Create payload strictly matching requirements
            const newItem: PortfolioItem = {
                id: i.id,
                title: i.title || '',
                description: i.description || '',
                imageUrl: i.imageUrl || '',
                category: i.category || '',
                majorCategory: i.majorCategory || MAJOR_CATEGORIES[0],
                type: i.type || WORK_TYPES[0],
                color: i.color || '',
                holiday: i.holiday || '', 
                link: i.link || '',
                date: dateStr
            };
            return newItem;
        });

    if (validItems.length === 0) {
        alert("請至少輸入一個有效的素材連結");
        setIsSaving(false);
        return;
    }
    
    // Debug log to verify what is being sent
    console.log("Submitting items to service:", validItems);

    try {
        await onSave(validItems);
        onClose();
    } catch (error) {
        console.error("Save error:", error);
        alert("✅ 作品已儲存至本機。\n⚠️ 但雲端同步失敗。請檢查設定指南以修復連線。");
        onClose(); 
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
        alert("✅ 已從本機刪除。\n⚠️ 但雲端同步失敗。");
        onClose();
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

  const defaults = itemsData.length > 0 ? itemsData[0] : createDefaultItem();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-[#F9F9F9] dark:bg-brand-black rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex-none px-8 py-6 bg-white dark:bg-brand-dark-card border-b border-gray-100 dark:border-gray-700 flex justify-between items-center z-10 transition-colors">
          <div className="flex items-center gap-4">
             <h2 className="text-2xl font-black text-brand-black dark:text-white tracking-tight transition-colors">
               {initialItem ? '編輯作品' : '新增作品'}
             </h2>
             {!initialItem && (
                <div className="flex items-center gap-2 bg-brand-yellow/20 px-4 py-1.5 rounded-full border border-brand-yellow/50">
                    <span className="text-sm font-bold text-brand-black dark:text-white">批次數量:</span>
                    <select 
                        className="bg-transparent font-black text-brand-black dark:text-white outline-none cursor-pointer"
                        value={batchSize}
                        onChange={handleBatchSizeChange}
                    >
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <option key={n} value={n} className="text-black">{n}</option>
                        ))}
                    </select>
                </div>
             )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
           {itemsData.map((formData, index) => {
             const currentColors = formData.color ? formData.color.split(',').filter(Boolean) : [];

             return (
               <div key={formData.id} className="bg-white dark:bg-brand-dark-card p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative transition-all hover:shadow-lg">
                 {!initialItem && batchSize > 1 && (
                    <div className="absolute -top-3 -left-3 bg-brand-black dark:bg-white text-white dark:text-black w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md z-10">
                        {index + 1}
                    </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-2">素材連結 (Asset URL) <span className="text-red-500">*</span></label>
                        <input
                            required={index === 0}
                            type="url"
                            placeholder="https://... (圖片或影片 .mp4)"
                            className="w-full px-5 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-brand-yellow/20 focus:border-brand-yellow outline-none bg-white text-black font-medium transition-all"
                            value={formData.imageUrl || ''}
                            onChange={e => updateItemData(index, 'imageUrl', e.target.value)}
                        />
                        {formData.imageUrl && (
                            <div className="mt-3 h-40 w-full bg-gray-50 dark:bg-black/30 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 flex items-center justify-center relative">
                                {isVideo(formData.imageUrl) ? (
                                    <video src={`${formData.imageUrl}#t=0.001`} className="h-full w-full object-contain" controls muted preload="metadata" />
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

                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-2">大分類</label>
                        <select
                            required
                            className="w-full px-5 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-brand-yellow/20 focus:border-brand-yellow outline-none bg-white text-black font-medium appearance-none"
                            value={formData.majorCategory || MAJOR_CATEGORIES[0]}
                            onChange={e => updateItemData(index, 'majorCategory', e.target.value)}
                        >
                            {MAJOR_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-2">類型</label>
                        <select
                            required
                            className="w-full px-5 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-brand-yellow/20 focus:border-brand-yellow outline-none bg-white text-black font-medium appearance-none"
                            value={formData.type || WORK_TYPES[0]}
                            onChange={e => updateItemData(index, 'type', e.target.value)}
                        >
                            {WORK_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-2">日期 (Date)</label>
                        <div className="flex gap-3">
                            <select 
                                className="flex-1 px-5 py-3 border border-gray-200 dark:border-gray-600 rounded-xl outline-none bg-white text-black font-medium appearance-none focus:border-brand-yellow"
                                value={formData.year || defaults.year}
                                onChange={(e) => updateItemData(index, 'year', e.target.value)}
                            >
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <select 
                                className="flex-1 px-5 py-3 border border-gray-200 dark:border-gray-600 rounded-xl outline-none bg-white text-black font-medium appearance-none focus:border-brand-yellow"
                                value={formData.mon || defaults.mon}
                                onChange={(e) => updateItemData(index, 'mon', e.target.value)}
                            >
                                {MONTHS.map(m => <option key={m} value={m}>{m}月</option>)}
                            </select>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 pl-1">格式: YYYY-MM</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-2">節日 (Holiday)</label>
                        <select
                            className="w-full px-5 py-3 border border-gray-200 dark:border-gray-600 rounded-xl outline-none bg-white text-black font-medium appearance-none focus:border-brand-yellow"
                            value={formData.holiday || ''}
                            onChange={e => updateItemData(index, 'holiday', e.target.value)}
                        >
                            <option value="">無</option>
                            {HOLIDAYS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-3">顏色 (最多3個)</label>
                        <div className="flex flex-wrap gap-3">
                            {COLORS.map(c => {
                                const isSelected = currentColors.includes(c);
                                return (
                                    <button
                                        type="button"
                                        key={c}
                                        onClick={() => toggleColor(index, c)}
                                        className={`flex items-center px-4 py-2 rounded-full border text-sm font-medium transition-all transform active:scale-95 ${isSelected ? 'border-black ring-1 ring-black bg-gray-50' : 'border-gray-200 dark:border-gray-600 bg-white hover:border-gray-400'}`}
                                    >
                                        <span className="w-3 h-3 rounded-full mr-2 border border-black/10 shadow-sm" style={{ backgroundColor: COLOR_HEX_MAP[c] }}/>
                                        <span className="text-black">{c}</span>
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
        <div className="flex-none px-8 py-5 bg-white dark:bg-brand-dark-card border-t border-gray-100 dark:border-gray-700 flex justify-between items-center z-10 transition-colors">
           {initialItem ? (
                <button
                    type="button" 
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="flex items-center px-6 py-3 text-white bg-black hover:bg-gray-800 rounded-xl transition-colors text-sm font-bold"
                >
                    <Trash2 size={18} className="mr-2" />
                    刪除
                </button>
            ) : <div />}
            
            <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex items-center px-8 py-3 bg-brand-yellow text-brand-black hover:brightness-110 rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-95 text-base font-bold"
            >
                <Save size={20} className="mr-2" />
                {isSaving ? 'Saving...' : `儲存 (${itemsData.length})`}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;