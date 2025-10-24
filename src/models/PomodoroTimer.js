/**
 * PomodoroTimer Model - Manages pomodoro timer state
 */
export class PomodoroTimer {
  constructor() {
    this.state = 'idle'; // idle, running, paused
    this.mode = 'work'; // work, shortBreak, longBreak
    this.previousMode = null; // Track previous mode for auto-start logic
    this.timeLeft = 25 * 60; // seconds
    this.totalTime = 25 * 60; // seconds
    this.startTime = null;
    this.pomodorosCompleted = 0;
    this.currentSession = 1;
    this.settings = null; // Will be set by updateSettings()
  }

  /**
   * Start timer
   */
  start() {
    if (this.state === 'idle' || this.state === 'paused') {
      this.state = 'running';
      this.startTime = Date.now() - (this.totalTime - this.timeLeft) * 1000;
    }
  }

  /**
   * Pause timer
   */
  pause() {
    if (this.state === 'running') {
      this.state = 'paused';
      this.updateTimeLeft();
    }
  }

  /**
   * Reset timer
   */
  reset() {
    this.state = 'idle';
    this.timeLeft = this.totalTime;
    this.startTime = null;
  }

  /**
   * Update time left based on current time
   */
  updateTimeLeft() {
    if (this.state === 'running' && this.startTime) {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.timeLeft = Math.max(0, this.totalTime - elapsed);

      if (this.timeLeft === 0) {
        this.onComplete();
      }
    }
  }

  /**
   * Get current time left
   * @returns {number} Time left in seconds
   */
  getTimeLeft() {
    if (this.state === 'running') {
      this.updateTimeLeft();
    }
    return this.timeLeft;
  }

  /**
   * Get progress percentage
   * @returns {number} Progress (0-100)
   */
  getProgress() {
    return ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
  }

  /**
   * Timer completed
   */
  onComplete() {
    console.log('🔔 PomodoroTimer.onComplete() called, current mode:', this.mode);
    this.state = 'idle';

    // Save previous mode before switching
    this.previousMode = this.mode;
    console.log('📝 Saved previousMode:', this.previousMode);

    if (this.mode === 'work') {
      this.pomodorosCompleted++;

      // Every 4 pomodoros = long break
      if (this.pomodorosCompleted % 4 === 0) {
        console.log('➡️ Switching to longBreak');
        this.switchMode('longBreak', this.settings);
      } else {
        console.log('➡️ Switching to shortBreak');
        this.switchMode('shortBreak', this.settings);
      }
    } else {
      // After break, go back to work
      console.log('➡️ Switching to work');
      this.switchMode('work', this.settings);
      this.currentSession++;
    }
    console.log('✓ Mode switched from', this.previousMode, 'to', this.mode);
  }

  /**
   * Switch timer mode
   * @param {string} mode - work, shortBreak, longBreak
   * @param {Object} settings - Optional settings object with durations
   */
  switchMode(mode, settings = null) {
    this.mode = mode;
    this.state = 'idle';

    // Use provided settings or default times
    let times;
    if (settings) {
      times = {
        work: settings.workDuration * 60,
        shortBreak: settings.shortBreakDuration * 60,
        longBreak: settings.longBreakDuration * 60
      };
    } else {
      times = {
        work: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60
      };
    }

    this.totalTime = times[mode];
    this.timeLeft = times[mode];
    this.startTime = null;
  }

  /**
   * Update settings
   * @param {Object} settings - Timer settings
   */
  updateSettings(settings) {
    this.settings = settings; // Save settings for later use

    if (settings.workDuration) {
      const times = {
        work: settings.workDuration * 60,
        shortBreak: settings.shortBreakDuration * 60,
        longBreak: settings.longBreakDuration * 60
      };

      this.totalTime = times[this.mode];
      if (this.state === 'idle') {
        this.timeLeft = this.totalTime;
      }
    }
  }

  /**
   * Serialize to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      state: this.state,
      mode: this.mode,
      previousMode: this.previousMode,
      timeLeft: this.timeLeft,
      totalTime: this.totalTime,
      startTime: this.startTime,
      pomodorosCompleted: this.pomodorosCompleted,
      currentSession: this.currentSession
    };
  }

  /**
   * Deserialize from JSON
   * @param {Object} data - JSON data
   */
  fromJSON(data) {
    this.state = data.state || 'idle';
    this.mode = data.mode || 'work';
    this.previousMode = data.previousMode || null;
    this.timeLeft = data.timeLeft || 25 * 60;
    this.totalTime = data.totalTime || 25 * 60;
    this.startTime = data.startTime;
    this.pomodorosCompleted = data.pomodorosCompleted || 0;
    this.currentSession = data.currentSession || 1;
  }
}
