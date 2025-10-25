#!/bin/bash
# Install systemd services (run as root)

set -e

echo "📝 Installing systemd services..."

# Copy service files
cp scripts/pomodoro-bot.service /etc/systemd/system/
cp scripts/pomodoro-api.service /etc/systemd/system/

# Reload systemd
systemctl daemon-reload

# Enable services
systemctl enable pomodoro-bot
systemctl enable pomodoro-api

echo "✅ Services installed!"
echo ""
echo "Commands:"
echo "  Start:   sudo systemctl start pomodoro-bot pomodoro-api"
echo "  Stop:    sudo systemctl stop pomodoro-bot pomodoro-api"
echo "  Restart: sudo systemctl restart pomodoro-bot pomodoro-api"
echo "  Status:  sudo systemctl status pomodoro-bot pomodoro-api"
echo "  Logs:    sudo journalctl -u pomodoro-bot -f"
