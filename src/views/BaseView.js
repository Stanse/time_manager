import { logger } from '../utils/Logger.js';

/**
 * BaseView - Abstract base class for all views
 * Provides common view functionality
 */
export class BaseView {
  constructor(element) {
    if (typeof element === 'string') {
      this.element = document.querySelector(element);
    } else {
      this.element = element;
    }

    if (!this.element) {
      throw new Error('View element not found');
    }
  }

  /**
   * Show the view
   */
  show() {
    this.element.style.display = 'block';
  }

  /**
   * Hide the view
   */
  hide() {
    this.element.style.display = 'none';
  }

  /**
   * Clear the view content
   */
  clear() {
    this.element.innerHTML = '';
  }

  /**
   * Set view content
   * @param {string} html - HTML content
   */
  setContent(html) {
    this.element.innerHTML = html;
  }

  /**
   * Append content to view
   * @param {string} html - HTML content
   */
  appendContent(html) {
    this.element.innerHTML += html;
  }

  /**
   * Add event listener to element
   * @param {string} event - Event name
   * @param {string} selector - CSS selector
   * @param {Function} handler - Event handler
   */
  on(event, selector, handler) {
    this.element.addEventListener(event, (e) => {
      logger.log(`👆 Click on element, looking for: ${selector}`);
      const target = e.target.closest(selector);
      if (target) {
        logger.log(`✅ Found target: ${selector}`);
        handler(e, target);
      } else {
        logger.log(`❌ Target not found: ${selector}`);
      }
    });
  }
}
