"""
API Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from telegram import Bot

from src.database.database import get_db
from src.services.user_service import UserService
from src.services.pomodoro_service import PomodoroService
from src.api.schemas import (
    PomodoroCompleteRequest,
    PomodoroCompleteResponse,
    StatsResponse,
    UserResponse
)
from src.api.auth import get_current_user
from src.config.settings import get_settings

router = APIRouter(prefix="/api", tags=["pomodoro"])


@router.post("/pomodoro/complete", response_model=PomodoroCompleteResponse)
async def complete_pomodoro(
    request: PomodoroCompleteRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Complete a pomodoro session

    This endpoint is called by the Mini App when a pomodoro is completed.
    It records the session and sends a notification via the bot.
    """
    # Verify user_id matches authenticated user
    if request.user_id != current_user.get('id'):
        raise HTTPException(status_code=403, detail="User ID mismatch")

    # Record pomodoro
    pomodoro_service = PomodoroService(db)
    pomodoro = pomodoro_service.record_pomodoro(
        user_id=request.user_id,
        mode=request.mode,
        duration=request.duration,
        started_at=request.started_at
    )

    # Send notification via bot
    settings = get_settings()
    bot = Bot(token=settings.telegram_bot_token)

    messages = {
        "work": "🎉 Помодоро завершено! Время отдохнуть.",
        "shortBreak": "💪 Короткий перерыв окончен! Продолжаем работу.",
        "longBreak": "🚀 Длинный перерыв окончен! Готов к новой сессии?"
    }

    message = messages.get(request.mode, "✅ Сессия завершена!")

    # Check daily goal
    goal_reached, completed, goal = pomodoro_service.check_daily_goal(request.user_id)

    if request.mode == "work":
        message += f"\n\n📊 Сегодня: {completed}/{goal} 🍅"

        if goal_reached and completed == goal:
            message += "\n\n🎯 Поздравляю! Цель на сегодня достигнута! 🎊"

    try:
        await bot.send_message(
            chat_id=request.user_id,
            text=message
        )
    except Exception as e:
        print(f"Failed to send notification: {e}")

    return PomodoroCompleteResponse(
        success=True,
        pomodoro_id=pomodoro.id,
        message="Pomodoro recorded successfully"
    )


@router.get("/stats/today", response_model=StatsResponse)
async def get_today_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get today's statistics"""
    user_id = current_user.get('id')

    user_service = UserService(db)
    pomodoro_service = PomodoroService(db)

    user = user_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    stats = pomodoro_service.get_today_stats(user_id)
    goal_reached, completed, goal = pomodoro_service.check_daily_goal(user_id)

    return StatsResponse(
        date=stats["date"],
        pomodoros_completed=stats["pomodoros_completed"],
        total_work_minutes=stats["total_work_minutes"],
        daily_goal=goal,
        goal_reached=goal_reached
    )


@router.get("/user", response_model=UserResponse)
async def get_user_info(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get user information"""
    user_id = current_user.get('id')

    user_service = UserService(db)
    user = user_service.get_user(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        id=user.id,
        username=user.username,
        first_name=user.first_name,
        daily_goal=user.daily_goal,
        notification_enabled=user.notification_enabled
    )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}
