/**
 * Fault-Tolerant Local Storage Helper with In-Memory Storage Fallback & State Hydration
 */

const STORAGE_PREFIX = 'attatrader_v2_';

// In-Memory Storage Fallback in case localStorage quota is exceeded or restricted
const inMemoryStore: Map<string, string> = new Map();

export const saveToStorage = <T>(key: string, data: T): void => {
  const fullKey = STORAGE_PREFIX + key;
  const serialized = JSON.stringify(data);

  try {
    localStorage.setItem(fullKey, serialized);
  } catch (error) {
    console.warn(`[Storage Warning] localStorage setItem failed for key "${key}", falling back to in-memory store:`, error);
    inMemoryStore.set(fullKey, serialized);
  }
};

export const getFromStorage = <T>(key: string, fallback: T): T => {
  const fullKey = STORAGE_PREFIX + key;

  try {
    const item = localStorage.getItem(fullKey);
    if (item !== null) {
      const parsed = JSON.parse(item);
      return parsed !== null && parsed !== undefined ? parsed : fallback;
    }
  } catch (error) {
    console.warn(`[Storage Warning] localStorage getItem failed for key "${key}", checking in-memory store:`, error);
  }

  // Check in-memory store fallback
  if (inMemoryStore.has(fullKey)) {
    try {
      const memItem = inMemoryStore.get(fullKey)!;
      const parsedMem = JSON.parse(memItem);
      return parsedMem !== null && parsedMem !== undefined ? parsedMem : fallback;
    } catch (e) {
      return fallback;
    }
  }

  return fallback;
};

export const removeFromStorage = (key: string): void => {
  const fullKey = STORAGE_PREFIX + key;
  try {
    localStorage.removeItem(fullKey);
  } catch (error) {
    // Ignore error
  }
  inMemoryStore.delete(fullKey);
};

export const clearAllStorage = (): void => {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch (error) {
    console.warn('[Storage Warning] Failed to clear localStorage:', error);
  }
  inMemoryStore.clear();
};
