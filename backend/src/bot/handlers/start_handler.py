"""
Start command handler
"""
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ContextTypes
from sqlalchemy.orm import Session

from src.bot.handlers.base import BaseHandler
from src.services.user_service import UserService
from src.config.settings import get_settings


class StartHandler(BaseHandler):
    """Handler for /start command"""

    async def execute(
        self,
        update: Update,
        context: ContextTypes.DEFAULT_TYPE,
        session: Session
    ):
        """Execute /start command"""
        user = update.effective_user
        if not user:
            return

        # Register user
        user_service = UserService(session)
        db_user = user_service.get_or_create_user(user)

        settings = get_settings()

        # Create keyboard with Mini App button
        keyboard = [
            [
                InlineKeyboardButton(
                    text="🍅 Открыть Pomodoro Timer",
                    web_app=WebAppInfo(url=settings.mini_app_url)
                )
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)

        welcome_text = f"""
👋 Привет, {user.first_name}!

Я помогу тебе эффективно работать с техникой Pomodoro:

🍅 *Pomodoro Timer* - таймер с отслеживанием сессий
📊 *Статистика* - отслеживание прогресса
🔔 *Уведомления* - напоминания о завершении

*Доступные команды:*
/start - Открыть таймер
/stats - Статистика за сегодня
/help - Справка

Нажми кнопку ниже, чтобы начать! 👇
"""

        await update.message.reply_text(
            text=welcome_text,
            reply_markup=reply_markup,
            parse_mode="Markdown"
        )
