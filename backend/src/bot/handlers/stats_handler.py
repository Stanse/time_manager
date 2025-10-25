"""
Stats command handler
"""
from telegram import Update
from telegram.ext import ContextTypes
from sqlalchemy.orm import Session

from src.bot.handlers.base import BaseHandler
from src.services.pomodoro_service import PomodoroService
from src.services.user_service import UserService


class StatsHandler(BaseHandler):
    """Handler for /stats command"""

    async def execute(
        self,
        update: Update,
        context: ContextTypes.DEFAULT_TYPE,
        session: Session
    ):
        """Execute /stats command"""
        user = update.effective_user
        if not user:
            return

        # Get services
        user_service = UserService(session)
        pomodoro_service = PomodoroService(session)

        # Ensure user exists
        db_user = user_service.get_or_create_user(user)

        # Get stats
        today_stats = pomodoro_service.get_today_stats(user.id)
        week_stats = pomodoro_service.get_week_stats(user.id)

        # Check goal
        goal_reached, completed, goal = pomodoro_service.check_daily_goal(user.id)

        # Format message
        goal_emoji = "🎯" if goal_reached else "📊"
        goal_text = f"{completed}/{goal} 🍅"

        stats_text = f"""
{goal_emoji} *Статистика за сегодня*

*Помодоро:* {goal_text}
*Время работы:* {today_stats['total_work_minutes']} минут

📈 *За последние 7 дней*
*Всего помодоро:* {week_stats['total_pomodoros']} 🍅
*Всего времени:* {week_stats['total_minutes']} минут
*В среднем в день:* {week_stats['average_per_day']} 🍅
"""

        if goal_reached:
            stats_text += "\n🎉 *Цель на сегодня достигнута!*"

        await update.message.reply_text(
            text=stats_text,
            parse_mode="Markdown"
        )
