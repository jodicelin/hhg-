
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string; // 自訂標籤
  majorCategory?: string; // 大分類
  type?: string; // 類型
  color?: string; // 顏色 (Comma separated string for multiple colors)
  holiday?: string; // 節日
  link?: string;
  date: string; // 合併後的日期 (YYYY-MM)
}

export interface SheetResponse {
  status: 'success' | 'error';
  data?: PortfolioItem[];
  message?: string;
}

export type ViewMode = 'GRID' | 'LIST';

// Constants for Dropdowns and Filters
export const MAJOR_CATEGORIES = [
  "美妝個清", 
  "3C產品", 
  "保健/食品", 
  "母嬰用品", 
  "潮流服飾", 
  "日用生活", 
  "旅遊戶外", 
  "家電"
];

export const WORK_TYPES = [
  "EDM", 
  "組圖框", 
  "BN", 
  "廣告"
];

export const COLORS = [
  "紅色", "綠色", "黃色", "橘色", "藍色", "金色", "粉紅色", "黑色", "白色", "咖啡色", "紫色"
];

// Map for displaying tags and pickers - Updated to Morandi Tones
export const COLOR_HEX_MAP: {[key: string]: string} = {
  '紅色': '#d48a8a', // Morandi Red
  '綠色': '#9fb5a7', // Morandi Green
  '黃色': '#e3d0a4', // Morandi Yellow
  '橘色': '#dcb394', // Morandi Orange
  '藍色': '#9baec8', // Morandi Blue
  '金色': '#c5b698', // Morandi Gold
  '粉紅色': '#dcaab6', // Morandi Pink
  '黑色': '#5e5e5e', // Morandi Black (Dark Grey)
  '白色': '#d1d5db', // Morandi White (Greyish to be visible)
  '咖啡色': '#a69082', // Morandi Brown
  '紫色': '#bdaacd'  // Morandi Purple
};

export const HOLIDAYS = [
  "新年", 
  "兒童節", 
  "婦女節", 
  "母親節", 
  "父親節", 
  "端午節", 
  "中元節", 
  "中秋節", 
  "雙11", 
  "雙12", 
  "黑色星期五",
  "聖誕節",
  "年末",
  "年中慶",
  "99購物節",
  "雙十節",
  "品牌週"
];
