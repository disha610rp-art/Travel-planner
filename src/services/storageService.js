// Storage Service — Wrapper around localStorage for JSON data persistence

const PREFIX = 'travelplanner_';

/**
 * Get an item from localStorage, parsed from JSON
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed value or default
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Set an item in localStorage as JSON
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON.stringified)
 */
export const setItem = (key, value) => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
  }
};

/**
 * Remove an item from localStorage
 * @param {string} key - Storage key
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
};

/**
 * Clear all app data from localStorage
 */
export const clearAll = () => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

export default { getItem, setItem, removeItem, clearAll };
