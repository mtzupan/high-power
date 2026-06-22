import os


def _get_database_url() -> str:
    url = os.getenv("DATABASE_URL", "sqlite:///./high_power.db")
    # Railway (and Heroku) emit postgres:// or postgresql:// — SQLAlchemy
    # requires the +psycopg2 driver suffix for the PostgreSQL dialect.
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


DATABASE_URL = _get_database_url()
