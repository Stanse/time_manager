import { PomodoroTimer } from '../models/PomodoroTimer.js';
import { PomodoroSettings } from '../models/PomodoroSettings.js';
import { storage } from './StorageService.js';
import { logger } from '../utils/Logger.js';
import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * PomodoroService - Manages pomodoro timer logic
 */
export class PomodoroService extends EventEmitter {
  static instance = null;
  static TIMER_KEY = 'pomodoro_timer';
  static SETTINGS_KEY = 'pomodoro_settings';

  constructor() {
    super();
    if (PomodoroService.instance) {
      return PomodoroService.instance;
    }

    this.timer = new PomodoroTimer();
    this.settings = new PomodoroSettings();
    this.updateInterval = null;

    PomodoroService.instance = this;
  }

  static getInstance() {
    if (!PomodoroService.instance) {
      PomodoroService.instance = new PomodoroService();
    }
    return PomodoroService.instance;
  }

  /**
   * Initialize service
   */
  async initialize() {
    logger.log('🍅 Initializing Pomodoro Service...');
    await this.loadTimer();
    await this.loadSettings();

    // Apply settings to timer
    this.timer.updateSettings(this.settings);

    logger.log('✓ Pomodoro Service initialized');
  }

  /**
   * Start timer
   */
  start() {
    this.timer.start();
    this.startUpdateInterval();
    this.emit('stateChanged', this.timer);
    logger.log('▶ Timer started');
  }

  /**
   * Pause timer
   */
  pause() {
    this.timer.pause();
    this.stopUpdateInterval();
    this.saveTimer();
    this.emit('stateChanged', this.timer);
    logger.log('⏸ Timer paused');
  }

  /**
   * Reset timer
   */
  reset() {
    this.timer.reset();
    this.stopUpdateInterval();
    this.saveTimer();
    this.emit('stateChanged', this.timer);
    logger.log('🔄 Timer reset');
  }

  /**
   * Switch mode
   * @param {string} mode - work, shortBreak, longBreak
   */
  switchMode(mode) {
    this.stopUpdateInterval();
    this.timer.switchMode(mode);
    this.timer.updateSettings(this.settings);
    this.saveTimer();
    this.emit('modeChanged', this.timer);
    this.emit('stateChanged', this.timer);

    // Update body class
    this.updateBodyClass(mode);

    logger.log(`🔄 Switched to ${mode} mode`);
  }

  /**
   * Update settings
   * @param {Object} newSettings - New settings
   */
  async updateSettings(newSettings) {
    this.settings.update(newSettings);
    this.timer.updateSettings(this.settings);
    await this.saveSettings();
    this.emit('settingsChanged', this.settings);
    logger.log('⚙️ Settings updated');
  }

  /**
   * Start update interval
   */
  startUpdateInterval() {
    this.stopUpdateInterval();
    this.updateInterval = setInterval(() => {
      this.timer.updateTimeLeft();

      if (this.timer.timeLeft === 0) {
        this.onTimerComplete();
      }

      this.emit('tick', this.timer);
    }, 1000);
  }

  /**
   * Stop update interval
   */
  stopUpdateInterval() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Timer completed
   */
  onTimerComplete() {
    this.stopUpdateInterval();
    this.saveTimer();

    // Play sound
    if (this.settings.soundEnabled) {
      this.playCompletionSound();
    }

    // Show notification
    if (this.settings.notificationsEnabled) {
      this.showNotification();
    }

    this.emit('completed', this.timer);
    this.emit('stateChanged', this.timer);

    // Update body class
    this.updateBodyClass(this.timer.mode);

    // Auto-start next session
    if (
      (this.timer.mode !== 'work' && this.settings.autoStartWork) ||
      (this.timer.mode === 'work' && this.settings.autoStartBreaks)
    ) {
      setTimeout(() => this.start(), 1000);
    }

    logger.log('✓ Timer completed');
  }

  /**
   * Play completion sound
   */
  playCompletionSound() {
    // Simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      logger.warn('Sound not supported:', error);
    }
  }

  /**
   * Show notification
   */
  showNotification() {
    const messages = {
      work: 'Break time! Take a rest. 🎉',
      shortBreak: 'Short break over! Back to work. 💪',
      longBreak: 'Long break over! Ready for next session? 🚀'
    };

    const previousMode = this.timer.mode === 'work' ? 'work' :
                         (this.timer.pomodorosCompleted % 4 === 0 ? 'longBreak' : 'shortBreak');

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: messages[previousMode],
        icon: '/icon.png',
        tag: 'pomodoro'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Pomodoro Timer', {
            body: messages[previousMode]
          });
        }
      });
    }
  }

  /**
   * Update body class for mode
   * @param {string} mode - Timer mode
   */
  updateBodyClass(mode) {
    document.body.className = '';
    document.body.classList.add(`${mode}-mode`);
  }

  /**
   * Load timer from storage
   */
  async loadTimer() {
    try {
      const data = await storage.get(PomodoroService.TIMER_KEY);
      if (data) {
        const parsed = JSON.parse(data);

        // ВАЖНО: При загрузке всегда останавливаем таймер
        parsed.state = 'idle';
        parsed.startTime = null;

        this.timer.fromJSON(parsed);
        logger.log('✓ Timer loaded from storage');
      }
    } catch (error) {
      logger.error('Error loading timer:', error);
    }

    // Update body class
    this.updateBodyClass(this.timer.mode);
  }

  /**
   * Save timer to storage
   */
  async saveTimer() {
    try {
      const data = JSON.stringify(this.timer.toJSON());
      await storage.set(PomodoroService.TIMER_KEY, data);
      logger.log('💾 Timer saved');
    } catch (error) {
      logger.error('Error saving timer:', error);
    }
  }

  /**
   * Load settings from storage
   */
  async loadSettings() {
    try {
      const data = await storage.get(PomodoroService.SETTINGS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.settings.fromJSON(parsed);
        logger.log('✓ Settings loaded from storage');
      }
    } catch (error) {
      logger.error('Error loading settings:', error);
    }
  }

  /**
   * Save settings to storage
   */
  async saveSettings() {
    try {
      const data = JSON.stringify(this.settings.toJSON());
      await storage.set(PomodoroService.SETTINGS_KEY, data);
      logger.log('💾 Settings saved');
    } catch (error) {
      logger.error('Error saving settings:', error);
    }
  }

  /**
   * Get timer
   * @returns {PomodoroTimer} Timer instance
   */
  getTimer() {
    return this.timer;
  }

  /**
   * Get settings
   * @returns {PomodoroSettings} Settings instance
   */
  getSettings() {
    return this.settings;
  }
}

export const pomodoroService = PomodoroService.getInstance();
