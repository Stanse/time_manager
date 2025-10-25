"""
Database models using SQLAlchemy
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, BigInteger, String, DateTime,
    Boolean, ForeignKey, func
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True)  # Telegram user ID
    username = Column(String(255), nullable=True)
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)
    language_code = Column(String(10), nullable=True)

    # Settings
    daily_goal = Column(Integer, default=8)
    notification_enabled = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    pomodoros = relationship("Pomodoro", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"


class Pomodoro(Base):
    """Pomodoro session model"""
    __tablename__ = "pomodoros"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Session info
    mode = Column(String(50), nullable=False)  # work, shortBreak, longBreak
    duration = Column(Integer, nullable=False)  # in minutes
    completed = Column(Boolean, default=True)

    # Timestamps
    started_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="pomodoros")

    def __repr__(self):
        return f"<Pomodoro(id={self.id}, user_id={self.user_id}, mode={self.mode})>"
