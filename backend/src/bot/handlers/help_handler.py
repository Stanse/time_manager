"""
Help command handler
"""
from telegram import Update
from telegram.ext import ContextTypes
from sqlalchemy.orm import Session

from src.bot.handlers.base import BaseHandler


class HelpHandler(BaseHandler):
    """Handler for /help command"""

    async def execute(
        self,
        update: Update,
        context: ContextTypes.DEFAULT_TYPE,
        session: Session
    ):
        """Execute /help command"""
        help_text = """
📖 *Справка по командам*

🍅 *Основные команды:*
/start - Открыть Pomodoro Timer
/stats - Статистика за сегодня
/help - Эта справка

💡 *Что такое Pomodoro?*
Техника управления временем:
• 25 минут работы
• 5 минут короткий перерыв
• После 4 помодоро - 15 минут длинный перерыв

📊 *Как это работает?*
1. Открой таймер через /start
2. Работай 25 минут
3. Отдыхай 5 минут
4. Отслеживай прогресс через /stats

🔔 Бот будет уведомлять тебя о завершении каждой сессии!

Удачи! 🚀
"""

        await update.message.reply_text(
            text=help_text,
            parse_mode="Markdown"
        )
