"""
Telegram Bot (Pattern: Facade, Observer)
"""
import logging
from telegram.ext import Application, CommandHandler

from src.config.settings import get_settings
from src.database.database import Database
from src.bot.handlers.start_handler import StartHandler
from src.bot.handlers.stats_handler import StatsHandler
from src.bot.handlers.help_handler import HelpHandler

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)


class PomodoroBot:
    """Main bot class (Facade pattern)"""

    def __init__(self):
        self.settings = get_settings()
        self.application = None
        self.db = Database()

        # Handlers
        self.start_handler = StartHandler()
        self.stats_handler = StatsHandler()
        self.help_handler = HelpHandler()

    def setup_handlers(self):
        """Setup command handlers"""
        self.application.add_handler(
            CommandHandler("start", self.start_handler.handle)
        )
        self.application.add_handler(
            CommandHandler("stats", self.stats_handler.handle)
        )
        self.application.add_handler(
            CommandHandler("help", self.help_handler.handle)
        )

        logger.info("✓ Handlers registered")

    async def post_init(self, application: Application):
        """Post initialization hook"""
        logger.info("🤖 Bot initialized")

    async def post_shutdown(self, application: Application):
        """Post shutdown hook"""
        logger.info("🛑 Bot stopped")

    def run(self):
        """Run bot with polling"""
        logger.info("🚀 Starting Pomodoro Bot...")

        # Create tables
        self.db.create_tables()
        logger.info("✓ Database tables created")

        # Build application
        self.application = (
            Application.builder()
            .token(self.settings.telegram_bot_token)
            .post_init(self.post_init)
            .post_shutdown(self.post_shutdown)
            .build()
        )

        # Setup handlers
        self.setup_handlers()

        # Run
        logger.info("✓ Bot is running...")
        self.application.run_polling(allowed_updates=["message", "callback_query"])


def main():
    """Entry point"""
    bot = PomodoroBot()
    bot.run()


if __name__ == "__main__":
    main()
