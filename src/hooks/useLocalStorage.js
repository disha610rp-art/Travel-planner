import { useState, useEffect } from 'react';

/**
 * useLocalStorage — Generic hook for syncing state with localStorage
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value
 * @returns {[*, Function]} Stateful value and setter
 */
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

export default useLocalStorage;
