import { PortfolioItem } from '../types';

/**
 * THE CODE BELOW IS STORED IN A STRING CONSTANT FOR THE UI TO COPY.
 * DO NOT COPY THIS FILE CONTENT INTO GOOGLE APPS SCRIPT.
 * USE THE 'COPY CODE' BUTTON IN THE ADMIN DASHBOARD.
 */

export const GOOGLE_APPS_SCRIPT_CODE = `
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // Handle both GET parameters and POST body
    const params = e.parameter.action ? e.parameter : (e.postData ? JSON.parse(e.postData.contents) : {});
    const action = params.action || 'read';
    
    if (action === 'read') {
      const data = sheet.getDataRange().getValues();
      if (data.length === 0) return createJSONOutput([]);
      
      const headers = data[0];
      const rows = data.slice(1);
      const result = rows.map(row => {
        let obj = {};
        headers.forEach((header, i) => obj[header] = row[i]);
        return obj;
      });
      return createJSONOutput(result);
    }
    
    // Updated Columns: id, title, description, imageUrl, category, link, dateCreated, majorCategory, type, color, holiday
    // Total 11 columns
    if (action === 'create') {
      const d = params.data;
      sheet.appendRow([
        d.id, 
        d.title, 
        d.description, 
        d.imageUrl, 
        d.category, 
        d.link, 
        d.dateCreated,
        d.majorCategory || '',
        d.type || '',
        d.color || '',
        d.holiday || ''
      ]);
      return createJSONOutput({status: 'success'});
    }
    
    if (action === 'update') {
      const d = params.data;
      const data = sheet.getDataRange().getValues();
      // Find row by ID (Column A is index 0)
      for(let i=1; i<data.length; i++) {
        if(data[i][0] == d.id) {
          // Update row (1-based index for getRange is i+1). Updating 11 columns.
          const range = sheet.getRange(i+1, 1, 1, 11);
          range.setValues([[
            d.id, 
            d.title, 
            d.description, 
            d.imageUrl, 
            d.category, 
            d.link, 
            d.dateCreated,
            d.majorCategory || '',
            d.type || '',
            d.color || '',
            d.holiday || ''
          ]]);
          return createJSONOutput({status: 'success'});
        }
      }
      return createJSONOutput({status: 'error', message: 'Item not found'});
    }

    if (action === 'delete') {
      const id = params.id;
      const data = sheet.getDataRange().getValues();
      for(let i=1; i<data.length; i++) {
        if(data[i][0] == id) {
           sheet.deleteRow(i+1);
           return createJSONOutput({status: 'success'});
        }
      }
      return createJSONOutput({status: 'error', message: 'Item not found'});
    }
    
  } catch (error) {
    return createJSONOutput({status: 'error', message: error.toString()});
  } finally {
    lock.releaseLock();
  }
}

function createJSONOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

const STORAGE_KEY = 'portfolio_data';
const SETTINGS_KEY = 'portfolio_settings';

// Default provided by user
const DEFAULT_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyNCup0xF2uIP7YGydR7Yp-CQmKMzGHZJYxJAcPuQP4AxghCg-TbOqHxrs0D9bxewNK/exec';

// Initial Mock Data with Chinese content
const INITIAL_DATA: PortfolioItem[] = [
  {
    id: '1',
    title: '夏日防曬大作戰',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1529236183275-4fdcf2bc987e?q=80&w=800&auto=format&fit=crop',
    category: '',
    majorCategory: '美妝個清',
    type: 'BN',
    color: '黃色',
    holiday: '',
    dateCreated: '2023-06-15',
    link: ''
  },
  {
    id: '2',
    title: '新年禮盒預購',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1548655299-a864e240b2e2?q=80&w=800&auto=format&fit=crop',
    category: '',
    majorCategory: '保健/食品',
    type: 'EDM',
    color: '紅色',
    holiday: '新年',
    dateCreated: '2023-12-10',
    link: ''
  },
  {
    id: '3',
    title: '極簡空氣清淨機',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1585771724684-382054863d61?q=80&w=800&auto=format&fit=crop',
    category: '',
    majorCategory: '家電',
    type: '廣告',
    color: '白色',
    holiday: '',
    dateCreated: '2024-01-20',
    link: ''
  },
  {
    id: '4',
    title: '雙11 3C狂歡節',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=800&auto=format&fit=crop',
    category: '',
    majorCategory: '3C產品',
    type: '組圖框',
    color: '藍色',
    holiday: '雙11',
    dateCreated: '2023-11-01',
    link: ''
  },
  {
    id: '5',
    title: '春季粉嫩彩妝',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=800&auto=format&fit=crop',
    category: '',
    majorCategory: '美妝個清',
    type: '廣告',
    color: '粉紅色',
    holiday: '婦女節',
    dateCreated: '2024-03-01',
    link: ''
  },
];

export const getSheetUrl = (): string => {
  const settings = localStorage.getItem(SETTINGS_KEY);
  // If user set a custom one, use it. Otherwise use default.
  return settings ? JSON.parse(settings).sheetUrl : DEFAULT_SHEET_URL;
};

export const setSheetUrl = (url: string) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ sheetUrl: url }));
};

// Fetch Items (Sheet -> Local Fallback)
export const fetchItems = async (): Promise<PortfolioItem[]> => {
  const sheetUrl = getSheetUrl();
  
  if (sheetUrl) {
    try {
      // Append ?action=read to ensure GET requests work smoothly with the script
      const response = await fetch(`${sheetUrl}?action=read`);
      const data = await response.json();
      
      // Basic validation
      if (Array.isArray(data)) {
        // Cache to local storage so even if offline, we have something
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn("Failed to fetch from Google Sheet, falling back to local storage.", e);
    }
  }

  const local = localStorage.getItem(STORAGE_KEY);
  if (!local) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  return JSON.parse(local);
};

// Create Item
export const createItem = async (item: PortfolioItem): Promise<void> => {
  const sheetUrl = getSheetUrl();
  
  // 1. Optimistic UI Update (Update Local immediately)
  const items = await fetchItems(); // Get current state
  const newItems = [item, ...items];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));

  // 2. Sync to Sheet
  if (sheetUrl) {
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'create', data: item }),
      });
    } catch (e) {
      console.error("Sync create error", e);
      alert("Saved locally, but failed to sync to Google Sheets. Check your URL.");
    }
  }
};

// Update Item
export const updateItem = async (updatedItem: PortfolioItem): Promise<void> => {
  const sheetUrl = getSheetUrl();

  // 1. Optimistic Update
  const items = await fetchItems();
  const newItems = items.map(i => i.id === updatedItem.id ? updatedItem : i);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));

  // 2. Sync
  if (sheetUrl) {
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'update', data: updatedItem }),
      });
    } catch (e) {
      console.error("Sync update error", e);
    }
  }
};

// Delete Item
export const deleteItem = async (id: string): Promise<void> => {
  const sheetUrl = getSheetUrl();

  // 1. Optimistic Update
  const items = await fetchItems();
  const newItems = items.filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));

  // 2. Sync
  if (sheetUrl) {
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'delete', id: id }),
      });
    } catch (e) {
      console.error("Sync delete error", e);
    }
  }
};