"""
Base handler (Pattern: Command, Template Method)
"""
from abc import ABC, abstractmethod
from telegram import Update
from telegram.ext import ContextTypes
from sqlalchemy.orm import Session

from src.database.database import Database


class BaseHandler(ABC):
    """Base handler for all bot commands (Template Method pattern)"""

    def __init__(self):
        self.db_manager = Database()

    async def handle(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Template method for handling commands"""
        with self.db_manager.session_scope() as session:
            try:
                await self.execute(update, context, session)
            except Exception as e:
                await self.handle_error(update, context, e)

    @abstractmethod
    async def execute(
        self,
        update: Update,
        context: ContextTypes.DEFAULT_TYPE,
        session: Session
    ):
        """Execute command logic (must be implemented by subclasses)"""
        pass

    async def handle_error(
        self,
        update: Update,
        context: ContextTypes.DEFAULT_TYPE,
        error: Exception
    ):
        """Handle errors"""
        print(f"Error in handler: {error}")
        if update.effective_chat:
            await context.bot.send_message(
                chat_id=update.effective_chat.id,
                text="❌ Произошла ошибка. Попробуйте позже."
            )
