
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { PortfolioItem, MAJOR_CATEGORIES, WORK_TYPES, COLORS, HOLIDAYS, COLOR_HEX_MAP } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: PortfolioItem | null;
  onSave: (item: PortfolioItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, initialItem, onSave, onDelete }) => {
  const [formData, setFormData] = useState<PortfolioItem>({
    id: '',
    title: '',
    description: '',
    imageUrl: '',
    category: '',
    majorCategory: '',
    type: '',
    color: '',
    holiday: '',
    link: '',
    dateCreated: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Helper to manage multi-select colors from string
  const getSelectedColors = () => {
    if (!formData.color) return [];
    return formData.color.split(',').filter(c => c);
  };

  const toggleColor = (color: string) => {
    const currentColors = getSelectedColors();
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
    setFormData({ ...formData, color: newColors.join(',') });
  };

  useEffect(() => {
    if (initialItem) {
      setFormData(initialItem);
    } else {
      // Set default date to current YYYY-MM
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      
      setFormData({
        id: crypto.randomUUID(),
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
      });
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (confirm('確定要刪除這個作品嗎？此動作無法復原。')) {
      setIsSaving(true);
      await onDelete(formData.id);
      setIsSaving(false);
      onClose();
    }
  };

  // Helper to check if URL is video
  const isVideo = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {initialItem ? '編輯作品' : '新增作品'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">作品標題 (Title)</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            {/* Major Category */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">大分類 (Category)</label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white"
                value={formData.majorCategory}
                onChange={e => setFormData({...formData, majorCategory: e.target.value})}
              >
                <option value="" disabled>請選擇分類</option>
                {MAJOR_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">類型 (Type)</label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="" disabled>請選擇類型</option>
                {WORK_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Date - Year and Month only */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">日期 (Year-Month)</label>
              <input
                type="month"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                value={formData.dateCreated}
                onChange={e => setFormData({...formData, dateCreated: e.target.value})}
              />
            </div>

             {/* Holiday */}
             <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">節日 (Holiday)</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white"
                value={formData.holiday}
                onChange={e => setFormData({...formData, holiday: e.target.value})}
              >
                <option value="">無</option>
                {HOLIDAYS.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* Color Multi-Select */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                顏色 (Color) <span className="text-xs font-normal text-gray-500">- 最多選 3 個</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => {
                  const isSelected = getSelectedColors().includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleColor(c)}
                      className={`
                        flex items-center px-3 py-1.5 rounded-full border text-xs font-medium transition-all
                        ${isSelected 
                          ? 'border-black ring-1 ring-black bg-gray-50' 
                          : 'border-gray-200 hover:border-gray-400 bg-white'}
                      `}
                    >
                      <span 
                        className="w-3 h-3 rounded-full mr-2 border border-black/10 shadow-sm"
                        style={{ backgroundColor: COLOR_HEX_MAP[c] }}
                      />
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Asset URL (Image or Video) */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">素材連結 (Asset URL)</label>
              <input
                required
                type="url"
                placeholder="https://... (圖片或影片 .mp4)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                value={formData.imageUrl}
                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              />
              <p className="text-xs text-gray-400 mt-1">支援圖片連結或 .mp4 影片檔案連結</p>
              
              {formData.imageUrl && (
                <div className="mt-2 h-48 w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center relative">
                    {isVideo(formData.imageUrl) ? (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <video 
                                src={formData.imageUrl} 
                                className="h-full w-full object-contain" 
                                controls
                                muted
                            />
                        </div>
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
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-gray-100">
            {initialItem ? (
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                >
                    <Trash2 size={16} className="mr-2" />
                    刪除
                </button>
            ) : <div />}
            
            <button
                type="submit"
                disabled={isSaving}
                className="flex items-center px-6 py-2 bg-black text-white hover:bg-gray-800 rounded-lg shadow-lg transition-transform transform active:scale-95 text-sm font-bold"
            >
                <Save size={16} className="mr-2" />
                {isSaving ? '儲存中...' : '儲存作品'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;
