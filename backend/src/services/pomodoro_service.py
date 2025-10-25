"""
Pomodoro service (Pattern: Repository, Strategy)
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from src.database.models import Pomodoro, User


class PomodoroService:
    """Service for pomodoro operations"""

    def __init__(self, db_session: Session):
        self.db = db_session

    def record_pomodoro(
        self,
        user_id: int,
        mode: str,
        duration: int,
        started_at: datetime
    ) -> Pomodoro:
        """Record completed pomodoro"""
        pomodoro = Pomodoro(
            user_id=user_id,
            mode=mode,
            duration=duration,
            started_at=started_at,
            completed_at=datetime.now(),
            completed=True
        )
        self.db.add(pomodoro)
        self.db.commit()
        self.db.refresh(pomodoro)
        return pomodoro

    def get_today_stats(self, user_id: int) -> dict:
        """Get today's statistics"""
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)

        pomodoros = self.db.query(Pomodoro).filter(
            and_(
                Pomodoro.user_id == user_id,
                Pomodoro.completed_at >= today_start,
                Pomodoro.completed_at < today_end,
                Pomodoro.mode == "work"
            )
        ).all()

        total_work = sum(p.duration for p in pomodoros if p.mode == "work")

        return {
            "date": today_start.date().isoformat(),
            "pomodoros_completed": len(pomodoros),
            "total_work_minutes": total_work,
            "sessions": [
                {
                    "mode": p.mode,
                    "duration": p.duration,
                    "completed_at": p.completed_at.isoformat()
                }
                for p in pomodoros
            ]
        }

    def get_week_stats(self, user_id: int) -> dict:
        """Get week statistics"""
        week_start = datetime.now() - timedelta(days=7)

        pomodoros = self.db.query(Pomodoro).filter(
            and_(
                Pomodoro.user_id == user_id,
                Pomodoro.completed_at >= week_start,
                Pomodoro.mode == "work"
            )
        ).all()

        return {
            "period": "last_7_days",
            "total_pomodoros": len(pomodoros),
            "total_minutes": sum(p.duration for p in pomodoros),
            "average_per_day": round(len(pomodoros) / 7, 1)
        }

    def check_daily_goal(self, user_id: int) -> tuple[bool, int, int]:
        """Check if daily goal is reached"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return False, 0, 0

        stats = self.get_today_stats(user_id)
        completed = stats["pomodoros_completed"]
        goal = user.daily_goal

        return completed >= goal, completed, goal
