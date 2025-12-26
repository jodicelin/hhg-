
import { PortfolioItem } from '../types';

/**
 * THE CODE BELOW IS STORED IN A STRING CONSTANT FOR THE UI TO COPY.
 * DO NOT COPY THIS FILE CONTENT INTO GOOGLE APPS SCRIPT.
 * USE THE 'COPY CODE' BUTTON IN THE ADMIN DASHBOARD.
 */

export const GOOGLE_APPS_SCRIPT_CODE = `
// VERSION: v17_strict_filter_and_data_alignment
// Update Date: 2025-05-23
// IMPORTANT: Please select "New Version" when deploying!

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  if (!e) return createJSONOutput({status: 'error', message: 'No event object'});
  const lock = LockService.getScriptLock();
  lock.tryLock(5000);
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    let params = {};
    if (e.parameter && e.parameter.action) {
      params = e.parameter;
    } else if (e.postData && e.postData.contents) {
      params = JSON.parse(e.postData.contents);
    }

    const action = params.action || 'read';
    
    function formatRow(d) {
      return [
        String(d.id || '').trim(), 
        String(d.imageUrl || '').trim(), 
        String(d.majorCategory || '').trim(), 
        String(d.type || '').trim(), 
        "'" + String(d.date || '').trim(), 
        String(d.holiday || '').trim(),
        String(d.color || '').trim()
      ];
    }

    if (action === 'read') {
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) return createJSONOutput([]); 
      const data = sheet.getRange(1, 1, lastRow, 7).getValues();
      const headers = data[0].map(function(h) { return String(h).toLowerCase().trim(); });
      const rows = data.slice(1);
      
      const result = rows.map(function(row) {
        let obj = {};
        headers.forEach(function(h, i) {
           let val = row[i];
           if (val instanceof Date) {
             val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM");
           }
           obj[h] = (val === undefined || val === null) ? "" : String(val).trim();
        });
        return obj;
      });
      // 過濾掉空行
      return createJSONOutput(result.filter(function(item) { return item.id && item.id.length > 0; }));
    }

    if (action === 'create') {
      sheet.appendRow(formatRow(params.data));
      return createJSONOutput({status: 'success'});
    }

    if (action === 'createBatch') {
      const rowsToAdd = params.data.map(formatRow);
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAdd.length, 7).setValues(rowsToAdd);
      return createJSONOutput({status: 'success'});
    }
    
    if (action === 'update') {
      const d = params.data;
      const data = sheet.getDataRange().getValues();
      for(let i=1; i<data.length; i++) {
        if(String(data[i][0]).trim() === String(d.id).trim()) {
          sheet.getRange(i+1, 1, 1, 7).setValues([formatRow(d)]);
          return createJSONOutput({status: 'success'});
        }
      }
    }

    if (action === 'delete') {
      const data = sheet.getDataRange().getValues();
      for(let i=1; i<data.length; i++) {
        if(String(data[i][0]).trim() === String(params.id).trim()) {
           sheet.deleteRow(i+1); 
           return createJSONOutput({status: 'success'});
        }
      }
    }
    return createJSONOutput({status: 'error', message: 'Action failed'});
  } catch (error) {
    return createJSONOutput({status: 'error', message: error.toString()});
  } finally {
    lock.releaseLock();
  }
}

function createJSONOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
`;

// ⚠️ 更改金鑰版本號強制刷新使用者本機緩存
const STORAGE_KEY = 'portfolio_data_v17_final'; 
const SETTINGS_KEY = 'portfolio_settings';
const DEFAULT_SHEET_URL = 'https://script.google.com/macros/s/AKfycby_Xpppo6UDhRmMFDYVPn3dxBvPBthT1a3ERNTQLxmLALkOIOPr2aW1TCbIEt0S_1LQ/exec';

const normalizeData = (data: any[]): PortfolioItem[] => {
  return data.map((row): PortfolioItem | null => {
    if (!row) return null;
    const item: any = {};
    // 同時對標題 key 也進行 trim，防止 "Holiday " 這種標題導致讀不到
    Object.keys(row).forEach(key => {
      item[key.toLowerCase().trim()] = String(row[key] || '').trim();
    });

    return {
      id: item.id || safeUUID(),
      title: item.title || '',
      description: item.description || '',
      imageUrl: item.imageurl || '',
      category: item.category || '',
      majorCategory: item.majorcategory || '', // 確保欄位名正確
      type: item.type || '',
      color: item.color || '',
      holiday: item.holiday || '',
      date: item.date || '',
      link: item.link || ''
    };
  }).filter((i): i is PortfolioItem => i !== null && !!i.imageUrl && i.imageUrl.startsWith('http'));
};

export const getSheetUrl = (): string => {
  try {
    const settings = localStorage.getItem(SETTINGS_KEY);
    return settings ? JSON.parse(settings).sheetUrl : DEFAULT_SHEET_URL;
  } catch (e) { return DEFAULT_SHEET_URL; }
};

export const setSheetUrl = (url: string) => localStorage.setItem(SETTINGS_KEY, JSON.stringify({ sheetUrl: url }));

export const safeUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

export const fetchItems = async (): Promise<PortfolioItem[]> => {
  const url = getSheetUrl();
  if (url) {
    try {
      const res = await fetch(`${url}?action=read`, { redirect: 'follow' });
      const raw = await res.json();
      if (Array.isArray(raw)) {
        const normalized = normalizeData(raw);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
      }
    } catch (e) { console.warn("Fetch Error:", e); }
  }
  const local = localStorage.getItem(STORAGE_KEY);
  return local ? JSON.parse(local) : [];
};

export const createItem = async (item: PortfolioItem) => {
  const url = getSheetUrl();
  if (url) await fetch(url, { method: 'POST', body: JSON.stringify({ action: 'create', data: item }), redirect: 'follow' });
};

export const createBatchItems = async (items: PortfolioItem[]) => {
  const url = getSheetUrl();
  if (url) await fetch(url, { method: 'POST', body: JSON.stringify({ action: 'createBatch', data: items }), redirect: 'follow' });
};

export const updateItem = async (item: PortfolioItem) => {
  const url = getSheetUrl();
  if (url) await fetch(url, { method: 'POST', body: JSON.stringify({ action: 'update', data: item }), redirect: 'follow' });
};

export const deleteItem = async (id: string) => {
  const url = getSheetUrl();
  if (url) await fetch(url, { method: 'POST', body: JSON.stringify({ action: 'delete', id }), redirect: 'follow' });
};
