import { PortfolioItem } from '../types';

/**
 * THE CODE BELOW IS STORED IN A STRING CONSTANT FOR THE UI TO COPY.
 * DO NOT COPY THIS FILE CONTENT INTO GOOGLE APPS SCRIPT.
 * USE THE 'COPY CODE' BUTTON IN THE ADMIN DASHBOARD.
 */

export const GOOGLE_APPS_SCRIPT_CODE = `
// VERSION: v13_strict_test_mode
// Update Date: 2025-05-23
// IMPORTANT: Please select "New Version" when deploying!

// ----------------------------------------------------------------
// 1. TEST FUNCTION (Run this in editor to check permissions)
// Select 'test' from the dropdown above and click 'Run'
// ----------------------------------------------------------------
function test() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    console.log("Connection successful!");
    console.log("Sheet Name: " + sheet.getName());
    console.log("Last Row: " + sheet.getLastRow());
    console.log("If you see this, the script works. Now deploy as Web App.");
  } catch (e) {
    console.error("Error accessing sheet: " + e.toString());
  }
}

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  // 2. SAFETY CHECK FOR MANUAL RUNS
  // This prevents the script from crashing if you accidentally run doGet/doPost in the editor
  if (!e) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error', 
      message: 'No event object detected. Do not run doGet/doPost directly in the editor. Use the test() function for checking permissions, or deploy as Web App to use.'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const lock = LockService.getScriptLock();
  lock.tryLock(5000);
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // SAFE PARSING
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
    
    // 3. STRICT 7-COLUMN MAPPING
    // A: id, B: imageUrl, C: majorCategory, D: type, E: date, F: holiday, G: color
    
    function formatRow(d) {
      // Ensure EVERY field is mapped to a string, even if empty.
      return [
        String(d.id || ''), 
        String(d.imageUrl || ''), 
        String(d.majorCategory || ''), 
        String(d.type || ''), 
        "'" + String(d.date || ''), // Force string for Date
        String(d.holiday || ''),    // Explicitly handle empty holiday
        String(d.color || '')       // Explicitly handle empty color
      ];
    }

    // 1. READ ACTION
    if (action === 'read') {
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) return createJSONOutput([]); 

      // Get all data (Force read 7 columns)
      const data = sheet.getRange(1, 1, lastRow, 7).getValues();
      const headers = data[0].map(function(h) { return String(h).toLowerCase().trim(); });
      const rows = data.slice(1);
      
      const result = rows.map(function(row) {
        let obj = {};
        headers.forEach(function(h, i) {
           let val = row[i];
           obj[h] = (val === undefined || val === null) ? "" : String(val);
        });
        return obj;
      });
      
      const cleanResult = result.filter(function(item) {
        return item.id && String(item.id).trim() !== "";
      });

      return createJSONOutput(cleanResult);
    }

    // 2. CREATE (Single)
    if (action === 'create') {
      const d = params.data;
      if (!d) return createJSONOutput({status: 'error', message: 'No data provided'});
      sheet.appendRow(formatRow(d));
      return createJSONOutput({status: 'success'});
    }

    // 3. CREATE BATCH (Multiple)
    if (action === 'createBatch') {
      const items = params.data;
      if (!Array.isArray(items)) {
         return createJSONOutput({status: 'error', message: 'Data is not an array'});
      }
      const rowsToAdd = items.map(formatRow);
      if (rowsToAdd.length > 0) {
        const lastRow = sheet.getLastRow();
        const range = sheet.getRange(lastRow + 1, 1, rowsToAdd.length, 7);
        range.setValues(rowsToAdd);
      }
      return createJSONOutput({status: 'success', count: rowsToAdd.length});
    }
    
    // 4. UPDATE
    if (action === 'update') {
      const d = params.data;
      const data = sheet.getDataRange().getValues();
      for(let i=1; i<data.length; i++) {
        if(String(data[i][0]) === String(d.id)) {
          const range = sheet.getRange(i+1, 1, 1, 7);
          range.setValues([formatRow(d)]);
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

// Increment version to force local storage reset
const STORAGE_KEY = 'portfolio_data_v13_strict'; 
const SETTINGS_KEY = 'portfolio_settings';
const DEFAULT_SHEET_URL = 'https://script.google.com/macros/s/AKfycby_Xpppo6UDhRmMFDYVPn3dxBvPBthT1a3ERNTQLxmLALkOIOPr2aW1TCbIEt0S_1LQ/exec';
const DATA_VERSION = 'v13_strict_test'; 

// Initial Mock Data (Fallback)
const INITIAL_DATA: PortfolioItem[] = [
  {
    id: '1',
    title: '', description: '', 
    imageUrl: 'https://images.unsplash.com/photo-1529236183275-4fdcf2bc987e?q=80&w=800&auto=format&fit=crop',
    category: '', majorCategory: '美妝個清', type: 'BN', color: '黃色', holiday: '', date: '2023-06', link: '' 
  },
  {
    id: '2',
    title: '', description: '', 
    imageUrl: 'https://images.unsplash.com/photo-1548655299-a864e240b2e2?q=80&w=800&auto=format&fit=crop',
    category: '', majorCategory: '保健/食品', type: 'EDM', color: '紅色', holiday: '新年', date: '2023-12', link: ''
  }
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

    let finalDate = String(lowerCased.date || '');
    if (!finalDate) {
        const y = lowerCased.year;
        const m = lowerCased.mon;
        if (y && m) finalDate = `${y}-${m}`;
    }

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
      date: finalDate,
      link: String(lowerCased.link || '')
    };
  }).filter((item): item is PortfolioItem => item !== null);
};

export const fetchItems = async (): Promise<PortfolioItem[]> => {
  const currentVersion = localStorage.getItem('data_version');
  if (currentVersion !== DATA_VERSION) {
    console.log("New version detected, clearing old local data...");
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem('data_version', DATA_VERSION);
  }

  const sheetUrl = getSheetUrl();
  
  if (sheetUrl) {
    try {
      const response = await fetch(`${sheetUrl}?action=read`, { 
        redirect: 'follow',
        credentials: 'omit'
      });
      if (response.ok) {
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
      }
    } catch (e) {
      console.warn("Failed to fetch from Google Sheet", e);
    }
  }

  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (!local) {
      return INITIAL_DATA;
    }
    return JSON.parse(local);
  } catch (e) {
    console.error("Local storage error", e);
    return INITIAL_DATA;
  }
};

export const createItem = async (item: PortfolioItem): Promise<void> => {
  const sheetUrl = getSheetUrl();
  const cleanItem = JSON.parse(JSON.stringify(item));

  const items = await fetchItems(); 
  const newItems = [cleanItem, ...items];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  } catch (e) {}

  if (sheetUrl) {
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: 'create', data: cleanItem }),
        redirect: 'follow',
        credentials: 'omit'
      });
    } catch (e) {
      console.error("Sync create error", e);
    }
  }
};

export const createBatchItems = async (batchItems: PortfolioItem[]): Promise<void> => {
  const sheetUrl = getSheetUrl();
  const cleanItems = JSON.parse(JSON.stringify(batchItems));
  
  const currentItems = await fetchItems();
  const newItems = [...cleanItems, ...currentItems];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  } catch (e) {}

  if (sheetUrl) {
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: 'createBatch', data: cleanItems }),
        redirect: 'follow',
        credentials: 'omit'
      });
    } catch (e) {
      console.error("Sync batch create error", e);
    }
  }
}

export const updateItem = async (updatedItem: PortfolioItem): Promise<void> => {
  const sheetUrl = getSheetUrl();
  const cleanItem = JSON.parse(JSON.stringify(updatedItem));

  const items = await fetchItems();
  const newItems = items.map(i => i.id === cleanItem.id ? cleanItem : i);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  } catch (e) {}

  if (sheetUrl) {
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: 'update', data: cleanItem }),
        redirect: 'follow',
        credentials: 'omit'
      });
    } catch (e) {
      console.error("Sync update error", e);
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
      await fetch(sheetUrl, {
        method: 'POST',
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: 'delete', id: id }),
        redirect: 'follow',
        credentials: 'omit'
      });
    } catch (e) {
      console.error("Sync delete error", e);
    }
  }
};