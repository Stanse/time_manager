"""
API Schemas (Pydantic models)
"""
from datetime import datetime
from pydantic import BaseModel, Field


class PomodoroCompleteRequest(BaseModel):
    """Request for completing a pomodoro"""
    user_id: int
    mode: str = Field(..., pattern="^(work|shortBreak|longBreak)$")
    duration: int = Field(..., gt=0)
    started_at: datetime


class PomodoroCompleteResponse(BaseModel):
    """Response for completing a pomodoro"""
    success: bool
    pomodoro_id: int
    message: str


class StatsResponse(BaseModel):
    """Response for stats"""
    date: str
    pomodoros_completed: int
    total_work_minutes: int
    daily_goal: int
    goal_reached: bool


class UserResponse(BaseModel):
    """User information response"""
    id: int
    username: str | None
    first_name: str | None
    daily_goal: int
    notification_enabled: bool

    class Config:
        from_attributes = True
