/**
 * Utility helper functions
 */

/**
 * Format a date string to a readable format
 * @param {string} dateStr - ISO date string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return '';
  const defaults = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', { ...defaults, ...options });
};

/**
 * Format currency amount
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Generate a unique ID
 * @returns {string}
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Debounce a function
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Truncate text to a maximum length
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Get file size in human-readable format
 * @param {number} bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
