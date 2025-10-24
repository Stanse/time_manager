/**
 * Pomodoro Timer - Main entry point
 */
import './styles/pomodoro-index.css';
import { PomodoroController } from './controllers/PomodoroController.js';
import { logger } from './utils/Logger.js';

logger.log('🍅 Pomodoro Timer initializing...');

// Check Telegram WebApp
if (window.Telegram?.WebApp) {
  logger.log('✅ Telegram WebApp detected');
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
} else {
  logger.log('📱 Running in browser mode');
}

// Initialize application
const app = new PomodoroController();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app.initialize();
  });
} else {
  app.initialize();
}

// Export for debugging
window.pomodoroApp = app;
