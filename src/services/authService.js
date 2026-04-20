// Auth Service — Local authentication using localStorage
import { getItem, setItem, removeItem } from './storageService';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

/**
 * Simple hash function for password storage
 * Note: NOT cryptographically secure — suitable for demo/academic use only
 */
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
};

/**
 * Get all registered users
 * @returns {Array} List of user objects
 */
const getUsers = () => getItem(USERS_KEY, []);

/**
 * Save users list
 * @param {Array} users - List of user objects
 */
const saveUsers = (users) => setItem(USERS_KEY, users);

/**
 * Sign up a new user
 * @param {string} name - User's full name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export const signup = (name, email, password) => {
  const users = getUsers();
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  if (users.find((u) => u.email === normalizedEmail)) {
    return { success: false, error: 'An account with this email already exists' };
  }

  const newUser = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: simpleHash(password),
    createdAt: new Date().toISOString(),
    avatar: name.trim().charAt(0).toUpperCase(),
  };

  users.push(newUser);
  saveUsers(users);

  // Auto-login after signup
  const { passwordHash, ...safeUser } = newUser;
  setItem(CURRENT_USER_KEY, safeUser);

  return { success: true, user: safeUser };
};

/**
 * Log in an existing user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export const login = (email, password) => {
  const users = getUsers();
  const normalizedEmail = email.toLowerCase().trim();

  const user = users.find((u) => u.email === normalizedEmail);
  if (!user) {
    return { success: false, error: 'No account found with this email' };
  }

  if (user.passwordHash !== simpleHash(password)) {
    return { success: false, error: 'Incorrect password' };
  }

  const { passwordHash, ...safeUser } = user;
  setItem(CURRENT_USER_KEY, safeUser);

  return { success: true, user: safeUser };
};

/**
 * Log out the current user
 */
export const logout = () => {
  removeItem(CURRENT_USER_KEY);
};

/**
 * Get the currently logged-in user
 * @returns {object|null} Current user or null
 */
export const getCurrentUser = () => {
  return getItem(CURRENT_USER_KEY, null);
};

/**
 * Check if a user is currently logged in
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

export default { signup, login, logout, getCurrentUser, isAuthenticated };
