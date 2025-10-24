import { logger } from '../utils/Logger.js';

/**
 * StorageService - Singleton pattern for data persistence
 * Supports both Telegram CloudStorage and localStorage
 */
export class StorageService {
  static instance = null;

  constructor() {
    if (StorageService.instance) {
      return StorageService.instance;
    }

    this.hasTelegramStorage = false;
    this.checkTelegramStorage();

    StorageService.instance = this;
  }

  /**
   * Get singleton instance
   * @returns {StorageService} StorageService instance
   */
  static getInstance() {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Check if Telegram CloudStorage is available
   */
  checkTelegramStorage() {
    this.hasTelegramStorage = !!(
      window.Telegram?.WebApp?.CloudStorage
    );

    if (this.hasTelegramStorage) {
      logger.log('✅ Telegram CloudStorage available');
    } else {
      logger.warn('⚠️ Telegram CloudStorage NOT available - using localStorage only');
    }
  }

  /**
   * Get item from storage
   * @param {string} key - Storage key
   * @returns {Promise<string|null>} Stored value or null
   */
  async get(key) {
    try {
      // Try Telegram CloudStorage first
      if (this.hasTelegramStorage) {
        return new Promise((resolve) => {
          window.Telegram.WebApp.CloudStorage.getItem(key, (error, value) => {
            if (error) {
              logger.warn('Telegram storage error, falling back to localStorage:', error);
              resolve(localStorage.getItem(key));
            } else {
              logger.log('✅ Got data from Telegram CloudStorage');
              resolve(value);
            }
          });
        });
      }

      // Fallback to localStorage
      return localStorage.getItem(key);
    } catch (error) {
      logger.error('Storage get error:', error);
      return localStorage.getItem(key);
    }
  }

  /**
   * Set item in storage
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   * @returns {Promise<void>}
   */
  async set(key, value) {
    try {
      // Try Telegram CloudStorage first
      if (this.hasTelegramStorage) {
        return new Promise((resolve) => {
          window.Telegram.WebApp.CloudStorage.setItem(key, value, (error) => {
            if (error) {
              logger.warn('Telegram storage error, falling back to localStorage:', error);
              localStorage.setItem(key, value);
            } else {
              logger.log('✅ Saved to Telegram CloudStorage');
            }
            resolve();
          });
        });
      }

      // Fallback to localStorage
      localStorage.setItem(key, value);
    } catch (error) {
      logger.error('Storage set error:', error);
      localStorage.setItem(key, value);
    }
  }

  /**
   * Remove item from storage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async remove(key) {
    try {
      if (this.hasTelegramStorage) {
        return new Promise((resolve) => {
          window.Telegram.WebApp.CloudStorage.removeItem(key, () => {
            resolve();
          });
        });
      }

      localStorage.removeItem(key);
    } catch (error) {
      logger.error('Storage remove error:', error);
      localStorage.removeItem(key);
    }
  }

  /**
   * Clear all storage
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      if (this.hasTelegramStorage) {
        return new Promise((resolve) => {
          window.Telegram.WebApp.CloudStorage.getKeys((error, keys) => {
            if (!error && keys) {
              window.Telegram.WebApp.CloudStorage.removeItems(keys, () => {
                resolve();
              });
            } else {
              resolve();
            }
          });
        });
      }

      localStorage.clear();
    } catch (error) {
      logger.error('Storage clear error:', error);
      localStorage.clear();
    }
  }
}

// Export singleton instance
export const storage = StorageService.getInstance();
