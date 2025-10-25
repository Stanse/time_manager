"""
Database connection and session management (Pattern: Singleton, Factory)
"""
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager

from src.config.settings import get_settings
from src.database.models import Base


class Database:
    """Database manager (Singleton pattern)"""

    _instance = None
    _engine = None
    _session_factory = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._engine is None:
            settings = get_settings()
            self._engine = create_engine(
                settings.database_url,
                pool_pre_ping=True,
                echo=settings.environment == "development"
            )
            self._session_factory = sessionmaker(
                bind=self._engine,
                autocommit=False,
                autoflush=False
            )

    def create_tables(self):
        """Create all tables"""
        Base.metadata.create_all(bind=self._engine)

    def get_session(self) -> Session:
        """Get database session (Factory pattern)"""
        return self._session_factory()

    @contextmanager
    def session_scope(self) -> Generator[Session, None, None]:
        """Context manager for database sessions"""
        session = self.get_session()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()


def get_db() -> Generator[Session, None, None]:
    """Dependency for FastAPI"""
    db = Database()
    with db.session_scope() as session:
        yield session
