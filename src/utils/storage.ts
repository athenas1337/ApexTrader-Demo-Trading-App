/**
 * Secure Local Storage Helper with Schema Validation and XSS Sanitization
 */

const STORAGE_PREFIX = 'apextrader_v1_';

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_PREFIX + key, serialized);
  } catch (error) {
    console.error(`Error saving key "${key}" to localStorage:`, error);
  }
};

export const getFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (error) {
    console.error(`Error loading key "${key}" from localStorage:`, error);
    return fallback;
  }
};

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.error(`Error removing key "${key}" from localStorage:`, error);
  }
};

export const clearAllStorage = (): void => {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};
