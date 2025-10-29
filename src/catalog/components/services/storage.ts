// src/catalog/services/storage.ts
export const saveToStorage = (type: string, data: any) => {
  const key = `catalog_${type}_${data.id}`;
  localStorage.setItem(key, JSON.stringify(data));
  return data.id;
};

export const loadFromStorage = (type: string, id: string) => {
  const key = `catalog_${type}_${id}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const listFromStorage = (type: string) => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(`catalog_${type}_`));
  return keys.map(k => JSON.parse(localStorage.getItem(k)!));
};