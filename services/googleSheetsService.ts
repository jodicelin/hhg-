
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
    
    // SAFE PARSING: Handle both GET parameters and POST body
    let params = {};
    if (e.parameter && e.parameter.action) {
      params = e.parameter;
    } else if (e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        return createJSONOutput({status: 'error', message: 'Invalid JSON body'});
      }
    }

    const action = params.action || 'read';
    
    // 1. READ ACTION
    if (action === 'read') {
      const data = sheet.getDataRange().getValues();
      if (data.length < 2) return createJSONOutput([]); // Only headers or empty
      
      const headers = data[0].map(h => String(h).toLowerCase());
      const rows = data.slice(1);
      
      const result = rows.map(row => {
        let obj = {};
        headers.forEach((h, i) => {
           let val = row[i];
           // Handle Date objects from Sheet (convert to YYYY-MM)
           if (val instanceof Date) {
              const y = val.getFullYear();
              const m = String(val.getMonth() + 1).padStart(2, '0');
              val = y + '-' + m;
           }
           obj[h] = String(val); // Force string
        });
        return obj;
      });
      return createJSONOutput(result);
    }
    
    // CONSTANT: Column Order for Writes
    // Column 1: id
    // Column 2: imageUrl
    // Column 3: majorCategory
    // Column 4: type
    // Column 5: dateCreated
    // Column 6: holiday
    // Column 7: color
    
    // 2. CREATE (Single)
    if (action === 'create') {
      const d = params.data;
      const row = [
        d.id, 
        d.imageUrl, 
        d.majorCategory || '', 
        d.type || '', 
        "'" + (d.dateCreated || ''), // Force string format
        d.holiday || '',
        d.color || ''
      ];
      sheet.appendRow(row);
      return createJSONOutput({status: 'success'});
    }

    // 3. CREATE BATCH (Multiple)
    if (action === 'createBatch') {
      const items = params.data;
      if (!Array.isArray(items)) {
         return createJSONOutput({status: 'error', message: 'Data is not an array'});
      }
      
      const rowsToAdd = items.map(d => [
        d.id, 
        d.imageUrl, 
        d.majorCategory || '', 
        d.type || '', 
        "'" + (d.dateCreated || ''), 
        d.holiday || '',
        d.color || ''
      ]);
      
      if (rowsToAdd.length > 0) {
        const lastRow = sheet.getLastRow();
        // getRange(row, column, numRows, numColumns)
        const range = sheet.getRange(lastRow + 1, 1, rowsToAdd.length, 7);
        range.setValues(rowsToAdd);
      }
      return createJSONOutput({status: 'success', count: rowsToAdd.length});
    }
    
    // 4. UPDATE
    if (action === 'update') {
      const d = params.data;
      const data = sheet.getDataRange().getValues();
      
      // Loop to find ID (Assuming ID is in Column A / Index 0)
      for(let i=1; i<data.length; i++) {
        // String comparison to be safe
        if(String(data[i][0]) === String(d.id)) {
          const range = sheet.getRange(i+1, 1, 1, 7);
          range.setValues([[
            d.id, 
            d.imageUrl, 
            d.majorCategory || '', 
            d.type || '', 
            "'" + (d.dateCreated || ''), 
            d.holiday || '',
            d.color || ''
          ]]);
          return createJSONOutput({status: 'success'});
        }
      }
      return createJSONOutput({status: 'error', message: 'Item not found'});
    }

    // 5. DELETE
    if (action === 'delete') {
      const id = params.id;
      const data = sheet.getDataRange().getValues();
      
      for(let i=1; i<data.length; i++) {
        if(String(data[i][0]) === String(id)) {
           sheet.deleteRow(i+1); 
           return createJSONOutput({status: 'success'});
        }
      }
      return createJSONOutput({status: 'error', message: 'Item not found'});
    }
    
    return createJSONOutput({status: 'error', message: 'Unknown action: ' + action});

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
const DEFAULT_SHEET_URL = 'https://script.google.com/macros/s/AKfycby_Xpppo6UDhRmMFDYVPn3dxBvPBthT1a3ERNTQLxmLALkOIOPr2aW1TCbIEt0S_1LQ/exec';

// Initial Mock Data with Chinese content - Cleaned up to match 7 fields
const INITIAL_DATA: PortfolioItem[] = [
  {
    id: '1',
    title: '', 
    description: '', 
    imageUrl: 'https://images.unsplash.com/photo-1529236183275-4fdcf2bc987e?q=80&w=800&auto=format&fit=crop',
    category: '', 
    majorCategory: '美妝個清',
    type: 'BN',
    color: '黃色',
    holiday: '',
    dateCreated: '2023-06',
    link: '' 
  },
  {
    id: '2',
    title: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1548655299-a864e240b2e2?q=80&w=800&auto=format&fit=crop',
    category: '', 
    majorCategory: '保健/食品',
    type: 'EDM',
    color: '紅色',
    holiday: '新年',
    dateCreated: '2023-12',
    link: ''
  },
  {
    id: '3',
    title: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1585771724684-382054863d61?q=80&w=800&auto=format&fit=crop',
    category: '', 
    majorCategory: '家電',
    type: '廣告',
    color: '白色',
    holiday: '',
    dateCreated: '2024-01',
    link: ''
  },
  {
    id: '4',
    title: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=800&auto=format&fit=crop',
    category: '', 
    majorCategory: '3C產品',
    type: '組圖框',
    color: '藍色',
    holiday: '雙11',
    dateCreated: '2023-11',
    link: ''
  },
  {
    id: '5',
    title: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=800&auto=format&fit=crop',
    category: '', 
    majorCategory: '美妝個清',
    type: '廣告',
    color: '粉紅色',
    holiday: '婦女節',
    dateCreated: '2024-03',
    link: ''
  },
];

export const getSheetUrl = (): string => {
  try {
    const settings = localStorage.getItem(SETTINGS_KEY);
    return settings ? JSON.parse(settings).sheetUrl : DEFAULT_SHEET_URL;
  } catch (e) {
    return DEFAULT_SHEET_URL;
  }
};

export const setSheetUrl = (url: string) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ sheetUrl: url }));
};

export const safeUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const normalizeData = (data: any[]): PortfolioItem[] => {
  return data.map((row): PortfolioItem | null => {
    if (!row) return null;

    const lowerCased: any = {};
    Object.keys(row).forEach(key => {
      lowerCased[key.toLowerCase()] = row[key];
    });

    return {
      id: String(lowerCased.id || safeUUID()),
      title: String(lowerCased.title || ''),
      description: String(lowerCased.description || ''),
      imageUrl: String(lowerCased.imageurl || ''),
      category: String(lowerCased.category || ''),
      majorCategory: String(lowerCased.majorcategory || ''),
      type: String(lowerCased.type || ''),
      color: String(lowerCased.color || ''),
      holiday: String(lowerCased.holiday || ''),
      dateCreated: String(lowerCased.datecreated || ''),
      link: String(lowerCased.link || '')
    };
  }).filter((item): item is PortfolioItem => item !== null);
};

export const fetchItems = async (): Promise<PortfolioItem[]> => {
  const sheetUrl = getSheetUrl();
  
  if (sheetUrl) {
    try {
      const response = await fetch(`${sheetUrl}?action=read`, { redirect: 'follow' });
      const rawData = await response.json();
      
      if (Array.isArray(rawData)) {
        const normalizedData = normalizeData(rawData);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedData));
        } catch (storageError) {
          console.warn("Could not save to local storage", storageError);
        }
        return normalizedData;
      }
    } catch (e) {
      console.warn("Failed to fetch from Google Sheet, falling back to local storage.", e);
    }
  }

  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (!local) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      } catch (storageError) {}
      return INITIAL_DATA;
    }
    return JSON.parse(local);
  } catch (e) {
    console.error("Local storage error, resetting data", e);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    } catch (storageError) {}
    return INITIAL_DATA;
  }
};

export const createItem = async (item: PortfolioItem): Promise<void> => {
  const sheetUrl = getSheetUrl();
  
  const items = await fetchItems(); 
  const newItems = [item, ...items];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  } catch (e) {}

  if (sheetUrl) {
    try {
      // Use text/plain to avoid CORS preflight, redirect: follow for GAS
      await fetch(sheetUrl, {
        method: 'POST',
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({ action: 'create', data: item }),
        redirect: 'follow'
      });
    } catch (e) {
      console.error("Sync create error", e);
      throw e;
    }
  }
};

// Batch Create Items
export const createBatchItems = async (batchItems: PortfolioItem[]): Promise<void> => {
  const sheetUrl = getSheetUrl();
  
  // 1. Optimistic
  const currentItems = await fetchItems();
  const newItems = [...batchItems, ...currentItems];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  } catch (e) {}

  // 2. Sync
  if (sheetUrl) {
    try {
      // Use text/plain to avoid CORS preflight, redirect: follow for GAS
      await fetch(sheetUrl, {
        method: 'POST',
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({ action: 'createBatch', data: batchItems }),
        redirect: 'follow'
      });
    } catch (e) {
      console.error("Sync batch create error", e);
      throw e;
    }
  }
}

export const updateItem = async (updatedItem: PortfolioItem): Promise<void> => {
  const sheetUrl = getSheetUrl();

  const items = await fetchItems();
  const newItems = items.map(i => i.id === updatedItem.id ? updatedItem : i);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  } catch (e) {}

  if (sheetUrl) {
    try {
      // Use text/plain to avoid CORS preflight, redirect: follow for GAS
      await fetch(sheetUrl, {
        method: 'POST',
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({ action: 'update', data: updatedItem }),
        redirect: 'follow'
      });
    } catch (e) {
      console.error("Sync update error", e);
      throw e;
    }
  }
};

export const deleteItem = async (id: string): Promise<void> => {
  const sheetUrl = getSheetUrl();

  const items = await fetchItems();
  const newItems = items.filter(i => i.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  } catch (e) {}

  if (sheetUrl) {
    try {
      // Use text/plain to avoid CORS preflight, redirect: follow for GAS
      await fetch(sheetUrl, {
        method: 'POST',
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({ action: 'delete', id: id }),
        redirect: 'follow'
      });
    } catch (e) {
      console.error("Sync delete error", e);
      throw e;
    }
  }
};
