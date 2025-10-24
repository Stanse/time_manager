import { BaseView } from './BaseView.js';
import { TimeFormatter } from '../utils/TimeFormatter.js';

/**
 * HeaderView - Renders header with total time
 */
export class HeaderView extends BaseView {
  constructor(element) {
    super(element);
    this.totalTimeElement = element.querySelector('#totalTime');
    this.interval = null;
  }

  /**
   * Update total time display
   * @param {number} totalTime - Total time in seconds
   */
  updateTotalTime(totalTime) {
    if (this.totalTimeElement) {
      this.totalTimeElement.textContent = TimeFormatter.format(totalTime);
    }
  }

  /**
   * Start interval for updating total time
   */
  startInterval(getTotalTime) {
    this.stopInterval();
    this.interval = setInterval(() => {
      this.updateTotalTime(getTotalTime());
    }, 1000);
  }

  /**
   * Stop interval
   */
  stopInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
