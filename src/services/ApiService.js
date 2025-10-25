/**
 * API Service for Backend Integration
 */
import { logger } from '../utils/Logger.js';

export class ApiService {
  static instance = null;

  constructor() {
    if (ApiService.instance) {
      return ApiService.instance;
    }

    // Get API URL from environment or use current domain
    this.baseUrl = this.getApiUrl();
    this.initData = null;

    ApiService.instance = this;
  }

  static getInstance() {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Get API URL
   */
  getApiUrl() {
    // In production, API is on the same domain
    // In development, you might want to use localhost:8000
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    return window.location.origin;
  }

  /**
   * Initialize with Telegram WebApp data
   */
  initialize() {
    if (window.Telegram?.WebApp?.initData) {
      this.initData = window.Telegram.WebApp.initData;
      logger.log('🔑 API Service initialized with Telegram auth');
    } else {
      logger.warn('⚠️ Telegram WebApp not available - running in browser mode');
    }
  }

  /**
   * Get authorization headers
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.initData) {
      headers['Authorization'] = this.initData;
    }

    return headers;
  }

  /**
   * Send pomodoro completion to backend
   * @param {Object} data - Pomodoro data
   */
  async reportPomodoroComplete(data) {
    if (!this.initData) {
      logger.log('⚠️ Not sending to API - no Telegram auth');
      return { success: false, reason: 'no_auth' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/pomodoro/complete`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          user_id: data.userId,
          mode: data.mode,
          duration: data.duration,
          started_at: data.startedAt
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      logger.log('✅ Pomodoro reported to backend:', result);
      return result;

    } catch (error) {
      logger.error('❌ Failed to report pomodoro:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get today's statistics
   */
  async getTodayStats() {
    if (!this.initData) {
      logger.log('⚠️ Not fetching stats - no Telegram auth');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/stats/today`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const stats = await response.json();
      logger.log('📊 Stats fetched:', stats);
      return stats;

    } catch (error) {
      logger.error('❌ Failed to fetch stats:', error);
      return null;
    }
  }

  /**
   * Get user information
   */
  async getUserInfo() {
    if (!this.initData) {
      logger.log('⚠️ Not fetching user info - no Telegram auth');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/user`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const user = await response.json();
      logger.log('👤 User info fetched:', user);
      return user;

    } catch (error) {
      logger.error('❌ Failed to fetch user info:', error);
      return null;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      const data = await response.json();
      logger.log('❤️ API Health:', data);
      return data.status === 'ok';
    } catch (error) {
      logger.error('❌ API Health check failed:', error);
      return false;
    }
  }
}

export const apiService = ApiService.getInstance();
