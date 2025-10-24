/**
 * Main application entry point
 */
import './styles/index.css';
import { AppController } from './controllers/AppController.js';
import { logger } from './utils/Logger.js';

// Log Telegram WebApp info
logger.log('🔍 Checking Telegram WebApp API...');
logger.log('window.Telegram exists:', !!window.Telegram);
logger.log('window.Telegram.WebApp exists:', !!window.Telegram?.WebApp);
logger.log('CloudStorage exists:', !!window.Telegram?.WebApp?.CloudStorage);

if (window.Telegram?.WebApp) {
  logger.log('✅ Telegram WebApp API detected!');
  logger.log('Platform:', window.Telegram.WebApp.platform);
  logger.log('Version:', window.Telegram.WebApp.version);
  if (window.Telegram.WebApp.initDataUnsafe?.user) {
    logger.log('User ID:', window.Telegram.WebApp.initDataUnsafe.user.id);
  }
} else {
  logger.warn('⚠️ Telegram WebApp API NOT detected - using localStorage only');
}

// Initialize application
logger.log('✓ Time Tracker App Initializing...');

const app = new AppController();

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app.initialize();
  });
} else {
  app.initialize();
}

// Export for debugging
window.app = app;
