# ⚡ Быстрый старт для VPS

Краткая инструкция для быстрого развертывания на DigitalOcean VPS.

## 📋 Подготовка (5 минут)

### 1. Получить Telegram Bot Token

```
1. Открыть Telegram → @BotFather
2. /newbot
3. Следовать инструкциям
4. Сохранить токен (123456789:ABC...)
```

### 2. Настроить DNS

```
A-запись: your-domain.com → IP_ВАШЕГО_VPS
Подождать 5-10 минут для распространения
```

## 🚀 Развертывание (15 минут)

### Шаг 1: SSH в VPS

```bash
ssh root@YOUR_VPS_IP
```

### Шаг 2: Быстрая установка всего одной командой

```bash
# Скопируйте и выполните весь блок сразу:
cd ~ && \
wget https://raw.githubusercontent.com/your-repo/time_manager/main/backend/scripts/quick_install.sh && \
chmod +x quick_install.sh && \
./quick_install.sh
```

**Или вручную:**

```bash
# 1. Установить систему
curl -O https://raw.githubusercontent.com/your-repo/time_manager/main/backend/scripts/setup_vps.sh
chmod +x setup_vps.sh
./setup_vps.sh

# 2. Настроить PostgreSQL
sudo -u postgres psql << EOF
CREATE USER pomodoro_user WITH PASSWORD 'CHANGE_PASSWORD';
CREATE DATABASE pomodoro_db OWNER pomodoro_user;
GRANT ALL PRIVILEGES ON DATABASE pomodoro_db TO pomodoro_user;
\c pomodoro_db
GRANT ALL ON SCHEMA public TO pomodoro_user;
EOF

# 3. Клонировать код
cd /var/www/pomodoro
git clone https://github.com/your-repo/time_manager.git .
cd backend

# 4. Настроить .env
cp .env.example .env
nano .env
# Заполнить TELEGRAM_BOT_TOKEN, DATABASE_URL, MINI_APP_URL

# 5. Установить приложение
sudo chown -R pomodoro:pomodoro /var/www/pomodoro
sudo su - pomodoro
cd /var/www/pomodoro/backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic revision --autogenerate -m "Initial"
alembic upgrade head
exit

# 6. Запустить сервисы
cd /var/www/pomodoro/backend
chmod +x scripts/*.sh
sudo bash scripts/install_services.sh
sudo systemctl start pomodoro-bot pomodoro-api

# 7. Настроить Nginx
sudo cp scripts/nginx.conf /etc/nginx/sites-available/pomodoro
sudo nano /etc/nginx/sites-available/pomodoro  # Изменить your-domain.com
sudo ln -s /etc/nginx/sites-available/pomodoro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 8. Получить SSL
sudo certbot --nginx -d your-domain.com
```

### Шаг 3: Проверка (1 минута)

```bash
# Статус сервисов
sudo systemctl status pomodoro-bot pomodoro-api

# API работает?
curl https://your-domain.com/api/health
# Ожидается: {"status":"ok"}

# Логи
sudo journalctl -u pomodoro-bot -n 20
```

### Шаг 4: Настроить бота в Telegram (2 минуты)

```
1. Telegram → @BotFather
2. /mybots → выбрать бота
3. Bot Settings → Menu Button → Configure menu button
4. URL: https://your-domain.com
5. Edit Bot → Edit Commands:
   start - Открыть Pomodoro Timer
   stats - Статистика за сегодня
   help - Справка
```

## ✅ Готово!

Протестируйте:
1. Telegram → найти бота → /start
2. Нажать кнопку "Открыть Pomodoro Timer"
3. Запустить помодоро
4. Дождаться завершения → получить уведомление от бота

## 🔧 Полезные команды

```bash
# Рестарт сервисов
sudo systemctl restart pomodoro-bot pomodoro-api

# Логи в реальном времени
sudo journalctl -u pomodoro-bot -f

# Статус
sudo systemctl status pomodoro-bot pomodoro-api nginx postgresql

# Проверка БД
sudo -u postgres psql pomodoro_db -c "SELECT COUNT(*) FROM users;"
```

## 🐛 Проблемы?

**Бот не отвечает:**
```bash
sudo journalctl -u pomodoro-bot -n 50
# Проверить TELEGRAM_BOT_TOKEN в .env
```

**API не работает:**
```bash
sudo journalctl -u pomodoro-api -n 50
curl http://localhost:8000/api/health
```

**SSL не настроен:**
```bash
# Проверить что домен указывает на VPS:
dig your-domain.com
# Повторить certbot:
sudo certbot --nginx -d your-domain.com
```

## 📚 Подробная документация

- Полная инструкция: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Архитектура и паттерны: [README.md](./README.md)
