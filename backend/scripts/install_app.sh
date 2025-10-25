#!/bin/bash
# Application installation script (run as pomodoro user)

set -e

echo "🔧 Installing Pomodoro application..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Go to app directory
cd /var/www/pomodoro/backend

# Create virtual environment
echo -e "${BLUE}🐍 Creating virtual environment...${NC}"
python3.12 -m venv venv

# Activate venv
source venv/bin/activate

# Upgrade pip
echo -e "${BLUE}📦 Upgrading pip...${NC}"
pip install --upgrade pip

# Install dependencies
echo -e "${BLUE}📚 Installing dependencies...${NC}"
pip install -r requirements.txt

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${BLUE}⚙️  Creating .env from example...${NC}"
    cp .env.example .env
    echo "⚠️  Please edit .env file with your settings!"
fi

# Run migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
alembic upgrade head

echo -e "${GREEN}✅ Application installed!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your settings"
echo "2. Install systemd services: sudo bash scripts/install_services.sh"
echo "3. Start services: sudo systemctl start pomodoro-bot pomodoro-api"
