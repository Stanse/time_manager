"""
FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import router
from src.config.settings import get_settings
from src.database.database import Database


def create_app() -> FastAPI:
    """Create FastAPI application (Factory pattern)"""
    settings = get_settings()

    app = FastAPI(
        title="Pomodoro Timer API",
        description="API for Pomodoro Timer Telegram Mini App",
        version="1.0.0"
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, specify exact origins
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(router)

    # Initialize database
    db = Database()
    db.create_tables()

    @app.on_event("startup")
    async def startup_event():
        print("🚀 API Server started")

    @app.on_event("shutdown")
    async def shutdown_event():
        print("🛑 API Server stopped")

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    settings = get_settings()
    uvicorn.run(
        "src.api.app:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.environment == "development"
    )
