-- PostgreSQL database setup script

-- Create database user
CREATE USER pomodoro_user WITH PASSWORD 'CHANGE_THIS_PASSWORD';

-- Create database
CREATE DATABASE pomodoro_db OWNER pomodoro_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pomodoro_db TO pomodoro_user;

-- Connect to database and grant schema privileges
\c pomodoro_db
GRANT ALL ON SCHEMA public TO pomodoro_user;
