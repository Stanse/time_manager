import { BaseView } from './BaseView.js';

/**
 * DebugView - Renders debug panel
 */
export class DebugView extends BaseView {
  constructor(panelElement, toggleElement) {
    super(panelElement);
    this.toggleElement = toggleElement;
    this.logsElement = this.element.querySelector('#debugLogs');
    this.enabled = false;
  }

  /**
   * Toggle debug panel
   */
  toggle() {
    this.enabled = !this.enabled;

    if (this.enabled) {
      this.element.classList.add('show');
      this.toggleElement.classList.add('active');
    } else {
      this.element.classList.remove('show');
      this.toggleElement.classList.remove('active');
    }

    return this.enabled;
  }

  /**
   * Add log entry
   * @param {Object} log - Log entry
   */
  addLog(log) {
    if (log.type === 'clear') {
      this.clear();
      return;
    }

    const logDiv = document.createElement('div');
    logDiv.className = `debug-log ${log.type}`;

    const messageStr = typeof log.message === 'object'
      ? JSON.stringify(log.message, null, 2)
      : String(log.message);

    logDiv.textContent = `[${log.timestamp}] ${messageStr}`;

    this.logsElement.appendChild(logDiv);

    // Auto-scroll to bottom
    this.logsElement.scrollTop = this.logsElement.scrollHeight;
  }

  /**
   * Clear all logs
   */
  clear() {
    this.logsElement.innerHTML = '';
  }

  /**
   * Check if debug is enabled
   * @returns {boolean} True if enabled
   */
  isEnabled() {
    return this.enabled;
  }
}
