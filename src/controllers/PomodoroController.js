import { pomodoroService } from '../services/PomodoroService.js';
import { logger } from '../utils/Logger.js';
import { PomodoroTimerView } from '../views/PomodoroTimerView.js';
import { PomodoroControlsView } from '../views/PomodoroControlsView.js';
import { DebugView } from '../views/DebugView.js';

/**
 * PomodoroController - Main controller for Pomodoro Timer
 */
export class PomodoroController {
  constructor() {
    this.service = pomodoroService;

    // Initialize views
    const timerElement = document.querySelector('.timer-circle');
    const controlsElement = document.querySelector('.timer-controls');

    if (!timerElement) {
      logger.error('Timer circle element not found');
    }
    if (!controlsElement) {
      logger.error('Timer controls element not found');
    }

    this.timerView = new PomodoroTimerView(timerElement);
    this.controlsView = new PomodoroControlsView(controlsElement);

    // Initialize debug view
    this.debugView = new DebugView(
      document.getElementById('debugPanel'),
      document.getElementById('debugToggle')
    );

    this.setupEventListeners();
    this.subscribeToServiceEvents();
  }

  /**
   * Initialize application
   */
  async initialize() {
    logger.log('🚀 Initializing Pomodoro Timer...');

    // Enable logger for debugging
    logger.enable();

    // Setup debug logger callback
    logger.onLog((log) => {
      if (this.debugView.isEnabled()) {
        this.debugView.addLog(log);
      }
    });

    await this.service.initialize();

    this.render();

    // Request notification permission only for non-Telegram environments
    if (!window.Telegram?.WebApp && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Initialize Telegram WebApp if available
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      logger.log('📱 Telegram WebApp initialized');
    }

    logger.log('✓ Pomodoro Timer ready!');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    logger.log('🔧 Setting up event listeners...');
    logger.log('Controls element:', this.controlsView.element);

    // Control buttons
    this.controlsView.on('click', '[data-action="start"]', () => this.handleStart());
    this.controlsView.on('click', '[data-action="pause"]', () => this.handlePause());
    this.controlsView.on('click', '[data-action="reset"]', () => this.handleReset());

    logger.log('✓ Control button listeners attached');

    // Mode tabs
    const modeTabs = document.querySelectorAll('.mode-tab');
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.mode;
        this.handleModeSwitch(mode);
      });
    });

    // Settings button
    const settingsBtn = document.querySelector('.settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openSettings());
    }

    // Settings modal
    const saveBtn = document.querySelector('#saveSettings');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveSettings());
    }

    const cancelBtn = document.querySelector('#cancelSettings');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeSettings());
    }

    // Toggle switches
    const toggles = document.querySelectorAll('.toggle-switch');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
      });
    });

    // Close modal on background click
    const modal = document.querySelector('.settings-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeSettings();
        }
      });
    }

    // Debug panel toggle
    const debugToggle = document.getElementById('debugToggle');
    if (debugToggle) {
      debugToggle.addEventListener('click', () => {
        this.debugView.toggle();
      });
    }

    // Debug panel clear button
    const debugClear = document.querySelector('.debug-clear');
    if (debugClear) {
      debugClear.addEventListener('click', () => {
        logger.clear();
      });
    }

    // Reset stats button
    const resetStatsBtn = document.getElementById('resetStatsBtn');
    if (resetStatsBtn) {
      resetStatsBtn.addEventListener('click', () => {
        this.handleResetStats();
      });
    }
  }

  /**
   * Subscribe to service events
   */
  subscribeToServiceEvents() {
    this.service.on('stateChanged', () => this.render());
    this.service.on('modeChanged', () => this.render());
    this.service.on('tick', (timer) => {
      this.timerView.updateTime(timer.timeLeft, timer.totalTime);
      this.updateStats();
    });
    this.service.on('completed', () => {
      this.timerView.addPulse();
      this.updateStats();
    });
  }

  /**
   * Render application
   */
  render() {
    const timer = this.service.getTimer();

    // Render timer
    this.timerView.render(timer);

    // Render controls
    this.controlsView.render(timer.state);

    // Update mode tabs
    this.updateModeTabs(timer.mode);

    // Update stats
    this.updateStats();
  }

  /**
   * Update mode tabs
   * @param {string} activeMode - Active mode
   */
  updateModeTabs(activeMode) {
    const tabs = document.querySelectorAll('.mode-tab');
    tabs.forEach(tab => {
      if (tab.dataset.mode === activeMode) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  /**
   * Update stats display
   */
  updateStats() {
    const timer = this.service.getTimer();

    const pomodorosEl = document.querySelector('#pomodorosCompleted');
    if (pomodorosEl) {
      pomodorosEl.textContent = timer.pomodorosCompleted;
    }

    const sessionEl = document.querySelector('#currentSession');
    if (sessionEl) {
      sessionEl.textContent = timer.currentSession;
    }
  }

  /**
   * Handle start button
   */
  handleStart() {
    logger.log('▶ Start button clicked');
    try {
      this.service.start();
      logger.log('✓ Timer started successfully');
    } catch (error) {
      logger.error('Error starting timer:', error);
    }
  }

  /**
   * Handle pause button
   */
  handlePause() {
    logger.log('⏸ Pause button clicked');
    this.service.pause();
  }

  /**
   * Handle reset button
   */
  handleReset() {
    logger.log('🔄 Reset button clicked');
    this.service.reset();
  }

  /**
   * Handle mode switch
   * @param {string} mode - New mode
   */
  handleModeSwitch(mode) {
    logger.log(`🔄 Switching to ${mode} mode`);
    this.service.switchMode(mode);
  }

  /**
   * Handle reset stats
   */
  handleResetStats() {
    if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
      logger.log('🔄 Resetting statistics...');
      this.service.resetStats();
      logger.log('✓ Statistics reset');
    }
  }

  /**
   * Open settings modal
   */
  openSettings() {
    const modal = document.querySelector('.settings-modal');
    const settings = this.service.getSettings();

    // Populate settings
    document.querySelector('#workDuration').value = settings.workDuration;
    document.querySelector('#shortBreakDuration').value = settings.shortBreakDuration;
    document.querySelector('#longBreakDuration').value = settings.longBreakDuration;

    // Toggles
    this.setToggle('#autoStartBreaks', settings.autoStartBreaks);
    this.setToggle('#autoStartWork', settings.autoStartWork);
    this.setToggle('#soundEnabled', settings.soundEnabled);
    this.setToggle('#notificationsEnabled', settings.notificationsEnabled);

    modal.classList.add('show');
  }

  /**
   * Close settings modal
   */
  closeSettings() {
    const modal = document.querySelector('.settings-modal');
    modal.classList.remove('show');
  }

  /**
   * Save settings
   */
  async saveSettings() {
    const newSettings = {
      workDuration: parseInt(document.querySelector('#workDuration').value),
      shortBreakDuration: parseInt(document.querySelector('#shortBreakDuration').value),
      longBreakDuration: parseInt(document.querySelector('#longBreakDuration').value),
      autoStartBreaks: this.getToggle('#autoStartBreaks'),
      autoStartWork: this.getToggle('#autoStartWork'),
      soundEnabled: this.getToggle('#soundEnabled'),
      notificationsEnabled: this.getToggle('#notificationsEnabled')
    };

    await this.service.updateSettings(newSettings);
    this.closeSettings();
    logger.log('✓ Settings saved');
  }

  /**
   * Set toggle state
   * @param {string} selector - Toggle selector
   * @param {boolean} active - Active state
   */
  setToggle(selector, active) {
    const toggle = document.querySelector(selector);
    if (toggle) {
      if (active) {
        toggle.classList.add('active');
      } else {
        toggle.classList.remove('active');
      }
    }
  }

  /**
   * Get toggle state
   * @param {string} selector - Toggle selector
   * @returns {boolean} Active state
   */
  getToggle(selector) {
    const toggle = document.querySelector(selector);
    return toggle ? toggle.classList.contains('active') : false;
  }
}
