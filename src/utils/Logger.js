/**
 * Logger - Singleton pattern for debug logging
 */
export class Logger {
  static instance = null;

  constructor() {
    if (Logger.instance) {
      return Logger.instance;
    }

    this.enabled = false;
    this.maxLogs = 100;
    this.logs = [];
    this.callbacks = [];

    Logger.instance = this;
  }

  /**
   * Get singleton instance
   * @returns {Logger} Logger instance
   */
  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Enable debug logging
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable debug logging
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Subscribe to log events
   * @param {Function} callback - Callback function
   */
  onLog(callback) {
    this.callbacks.push(callback);
  }

  /**
   * Add a log entry
   * @param {string} message - Log message
   * @param {string} type - Log type (log, error, warn, info)
   */
  addLog(message, type = 'log') {
    const log = {
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };

    this.logs.push(log);

    // Remove old logs if too many
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Notify callbacks
    this.callbacks.forEach(callback => callback(log));
  }

  /**
   * Log a message
   * @param {...any} args - Arguments to log
   */
  log(...args) {
    console.log(...args);
    if (this.enabled) {
      args.forEach(arg => this.addLog(arg, 'log'));
    }
  }

  /**
   * Log an error
   * @param {...any} args - Arguments to log
   */
  error(...args) {
    console.error(...args);
    if (this.enabled) {
      args.forEach(arg => this.addLog(arg, 'error'));
    }
  }

  /**
   * Log a warning
   * @param {...any} args - Arguments to log
   */
  warn(...args) {
    console.warn(...args);
    if (this.enabled) {
      args.forEach(arg => this.addLog(arg, 'warn'));
    }
  }

  /**
   * Log info
   * @param {...any} args - Arguments to log
   */
  info(...args) {
    console.info(...args);
    if (this.enabled) {
      args.forEach(arg => this.addLog(arg, 'info'));
    }
  }

  /**
   * Clear all logs
   */
  clear() {
    this.logs = [];
    this.callbacks.forEach(callback => callback({ type: 'clear' }));
  }

  /**
   * Get all logs
   * @returns {Array} Array of log entries
   */
  getLogs() {
    return [...this.logs];
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
