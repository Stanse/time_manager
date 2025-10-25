import { BaseView } from './BaseView.js';

/**
 * PomodoroTimerView - Renders circular timer
 */
export class PomodoroTimerView extends BaseView {
  constructor(element) {
    super(element);
    this.radius = 140;
    this.circumference = 2 * Math.PI * this.radius;
  }

  /**
   * Render timer
   * @param {PomodoroTimer} timer - Timer model
   */
  render(timer) {
    const minutes = Math.floor(timer.timeLeft / 60);
    const seconds = timer.timeLeft % 60;
    const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const modeLabels = {
      work: 'Focus Time',
      shortBreak: 'Short Break',
      longBreak: 'Long Break'
    };

    const progress = timer.getProgress();
    const offset = this.circumference - (progress / 100) * this.circumference;

    const html = `
      <svg class="circle-bg" viewBox="0 0 300 300">
        <circle class="circle-bg-path" cx="150" cy="150" r="${this.radius}"/>
      </svg>
      <svg class="circle-progress" viewBox="0 0 300 300">
        <circle
          class="circle-progress-path"
          cx="150"
          cy="150"
          r="${this.radius}"
          stroke-dasharray="${this.circumference}"
          stroke-dashoffset="${offset}"
        />
      </svg>
      <div class="timer-display">
        <div class="timer-time">${timeDisplay}</div>
        <div class="timer-label">${modeLabels[timer.mode]}</div>
      </div>
    `;

    this.setContent(html);
  }

  /**
   * Update time display (for smooth updates)
   * @param {number} timeLeft - Time left in seconds
   * @param {number} totalTime - Total time in seconds
   */
  updateTime(timeLeft, totalTime) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const timeEl = this.element.querySelector('.timer-time');
    if (timeEl) {
      timeEl.textContent = timeDisplay;
    }

    // Update progress
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    const offset = this.circumference - (progress / 100) * this.circumference;

    const progressPath = this.element.querySelector('.circle-progress-path');
    if (progressPath) {
      progressPath.style.strokeDashoffset = offset;
    }
  }

  /**
   * Add pulse animation
   */
  addPulse() {
    this.element.classList.add('pulse');
    setTimeout(() => {
      this.element.classList.remove('pulse');
    }, 1000);
  }
}
