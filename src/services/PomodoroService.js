import { PomodoroTimer } from '../models/PomodoroTimer.js';
import { PomodoroSettings } from '../models/PomodoroSettings.js';
import { storage } from './StorageService.js';
import { logger } from '../utils/Logger.js';
import { EventEmitter } from '../utils/EventEmitter.js';
import { apiService } from './ApiService.js';

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

    // Initialize API service
    apiService.initialize();

    // Check API health
    const apiHealthy = await apiService.healthCheck();
    if (apiHealthy) {
      logger.log('✓ Backend API is available');
    } else {
      logger.warn('⚠️ Backend API is not available - working in offline mode');
    }

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
   * Reset statistics (pomodoros and session count)
   */
  resetStats() {
    this.timer.pomodorosCompleted = 0;
    this.timer.currentSession = 1;
    this.saveTimer();
    this.emit('stateChanged', this.timer);
    logger.log('📊 Statistics reset');
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

      if (this.timer.timeLeft === 0 && this.timer.state === 'running') {
        logger.log('⏰ Timer reached 0, calling timer.onComplete()');
        this.timer.onComplete();
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
    logger.log('🏁 PomodoroService.onTimerComplete() called');
    this.stopUpdateInterval();
    this.saveTimer();

    // Send data to backend API
    this.reportToBackend();

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

    // Auto-start next session based on PREVIOUS mode
    logger.log('🔍 Auto-start check:');
    logger.log('  previousMode:', this.timer.previousMode);
    logger.log('  currentMode:', this.timer.mode);
    logger.log('  autoStartBreaks:', this.settings.autoStartBreaks);
    logger.log('  autoStartWork:', this.settings.autoStartWork);

    if (
      (this.timer.previousMode === 'work' && this.settings.autoStartBreaks) ||
      (this.timer.previousMode !== 'work' && this.timer.previousMode !== null && this.settings.autoStartWork)
    ) {
      logger.log('✅ Auto-start condition met! Starting in 1 second...');
      setTimeout(() => this.start(), 1000);
    } else {
      logger.log('❌ Auto-start condition NOT met');
    }

    logger.log('✓ Timer completed');
  }

  /**
   * Report completed pomodoro to backend
   */
  async reportToBackend() {
    // Only report if we have Telegram user data
    if (!window.Telegram?.WebApp?.initDataUnsafe?.user) {
      logger.log('⚠️ No Telegram user data - skipping backend report');
      return;
    }

    const user = window.Telegram.WebApp.initDataUnsafe.user;
    const previousMode = this.timer.previousMode || 'work';

    // Calculate duration based on settings
    const duration = previousMode === 'work' ? this.settings.workDuration :
                     previousMode === 'shortBreak' ? this.settings.shortBreakDuration :
                     this.settings.longBreakDuration;

    // Calculate start time (approximately)
    const completedAt = new Date();
    const startedAt = new Date(completedAt.getTime() - (duration * 60 * 1000));

    try {
      await apiService.reportPomodoroComplete({
        userId: user.id,
        mode: previousMode,
        duration: duration,
        startedAt: startedAt.toISOString()
      });
    } catch (error) {
      logger.error('Failed to report to backend:', error);
    }
  }

  /**
   * Play completion sound
   */
  playCompletionSound() {
    // Use Telegram haptic feedback instead of sound
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        // Use notification impact for completion
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');

        // Add extra impacts for emphasis
        setTimeout(() => {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }, 100);

        setTimeout(() => {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }, 200);

        logger.log('🔔 Haptic feedback triggered');
      } else {
        // Fallback to Web Audio API for non-Telegram environments (testing)
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

        logger.log('🔊 Web Audio fallback used');
      }
    } catch (error) {
      logger.warn('Sound/Haptic not supported:', error);
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

    // Determine which message to show based on PREVIOUS mode
    const previousMode = this.timer.previousMode || 'work';
    const message = messages[previousMode] || 'Timer completed!';

    try {
      if (window.Telegram?.WebApp?.showAlert) {
        // Use Telegram's showAlert for notifications
        window.Telegram.WebApp.showAlert(message);
        logger.log('📢 Telegram alert shown:', message);
      } else if ('Notification' in window && Notification.permission === 'granted') {
        // Fallback to browser notifications for non-Telegram environments
        new Notification('Pomodoro Timer', {
          body: message,
          icon: '/icon.png',
          tag: 'pomodoro'
        });
        logger.log('📢 Browser notification shown');
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        // Request permission and show notification
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Pomodoro Timer', {
              body: message
            });
          }
        });
      }
    } catch (error) {
      logger.warn('Notification not supported:', error);
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
