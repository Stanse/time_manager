#!/bin/bash
# Setup script for VPS deployment

set -e  # Exit on error

echo "🚀 Setting up Pomodoro Bot on VPS..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Update system
echo -e "${BLUE}📦 Updating system...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Python 3.12
echo -e "${BLUE}🐍 Installing Python 3.12...${NC}"
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.12 python3.12-venv python3.12-dev python3-pip

# Install PostgreSQL
echo -e "${BLUE}🗄️  Installing PostgreSQL...${NC}"
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
echo -e "${BLUE}🌐 Installing Nginx...${NC}"
sudo apt install -y nginx

# Install certbot for SSL
echo -e "${BLUE}🔒 Installing Certbot...${NC}"
sudo apt install -y certbot python3-certbot-nginx

# Create application user
echo -e "${BLUE}👤 Creating application user...${NC}"
sudo useradd -m -s /bin/bash pomodoro || echo "User already exists"

# Create directories
echo -e "${BLUE}📁 Creating directories...${NC}"
sudo mkdir -p /var/www/pomodoro
sudo chown -R pomodoro:pomodoro /var/www/pomodoro

# Create log directory
sudo mkdir -p /var/log/pomodoro
sudo chown -R pomodoro:pomodoro /var/log/pomodoro

echo -e "${GREEN}✅ System setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Setup PostgreSQL database: sudo -u postgres psql -f scripts/setup_db.sql"
echo "2. Copy your code to /var/www/pomodoro/backend/"
echo "3. Create .env file with your settings"
echo "4. Run scripts/install_app.sh as pomodoro user"
