"""
User service (Pattern: Repository)
"""
from sqlalchemy.orm import Session
from telegram import User as TelegramUser

from src.database.models import User


class UserService:
    """Service for user operations"""

    def __init__(self, db_session: Session):
        self.db = db_session

    def get_or_create_user(self, telegram_user: TelegramUser) -> User:
        """Get existing user or create new one"""
        user = self.db.query(User).filter(User.id == telegram_user.id).first()

        if not user:
            user = User(
                id=telegram_user.id,
                username=telegram_user.username,
                first_name=telegram_user.first_name,
                last_name=telegram_user.last_name,
                language_code=telegram_user.language_code
            )
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)

        return user

    def update_daily_goal(self, user_id: int, goal: int) -> User:
        """Update user's daily goal"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            user.daily_goal = goal
            self.db.commit()
            self.db.refresh(user)
        return user

    def get_user(self, user_id: int) -> User | None:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()
