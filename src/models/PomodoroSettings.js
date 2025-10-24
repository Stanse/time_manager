/**
 * PomodoroSettings Model - Manages user settings
 */
export class PomodoroSettings {
  constructor() {
    this.workDuration = 25; // minutes
    this.shortBreakDuration = 5; // minutes
    this.longBreakDuration = 15; // minutes
    this.autoStartBreaks = false;
    this.autoStartWork = false;
    this.soundEnabled = true;
    this.notificationsEnabled = true;
  }

  /**
   * Update settings
   * @param {Object} newSettings - New settings
   */
  update(newSettings) {
    Object.assign(this, newSettings);
  }

  /**
   * Serialize to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      workDuration: this.workDuration,
      shortBreakDuration: this.shortBreakDuration,
      longBreakDuration: this.longBreakDuration,
      autoStartBreaks: this.autoStartBreaks,
      autoStartWork: this.autoStartWork,
      soundEnabled: this.soundEnabled,
      notificationsEnabled: this.notificationsEnabled
    };
  }

  /**
   * Deserialize from JSON
   * @param {Object} data - JSON data
   */
  fromJSON(data) {
    this.workDuration = data.workDuration || 25;
    this.shortBreakDuration = data.shortBreakDuration || 5;
    this.longBreakDuration = data.longBreakDuration || 15;
    this.autoStartBreaks = data.autoStartBreaks || false;
    this.autoStartWork = data.autoStartWork || false;
    this.soundEnabled = data.soundEnabled !== undefined ? data.soundEnabled : true;
    this.notificationsEnabled = data.notificationsEnabled !== undefined ? data.notificationsEnabled : true;
  }
}
