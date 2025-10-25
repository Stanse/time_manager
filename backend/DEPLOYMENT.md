# 🚀 Инструкция по развертыванию Pomodoro Bot на VPS

## 📋 Требования

- Ubuntu 20.04+ VPS на DigitalOcean
- Доменное имя (например: pomodoro.example.com)
- Telegram Bot Token (получить у @BotFather)
- SSH доступ к VPS

## 🏗️ Архитектура

```
DigitalOcean VPS
├── Nginx (reverse proxy, SSL)
├── PostgreSQL (database)
├── Systemd Services
│   ├── pomodoro-bot (Telegram Bot)
│   └── pomodoro-api (FastAPI)
└── Frontend (Mini App статика)
```

## 📦 Шаг 1: Подготовка локальной машины

### 1.1 Создать Telegram Bot

```bash
# В Telegram найдите @BotFather и выполните:
/newbot
# Следуйте инструкциям и сохраните TOKEN
```

### 1.2 Настроить DNS

```
Создайте A-запись для вашего домена:
Type: A
Name: @ (или поддомен, например "pomodoro")
Value: IP_АДРЕС_ВАШЕГО_VPS
TTL: 3600
```

### 1.3 Подготовить код

```bash
# Склонировать репозиторий
cd /path/to/time_manager

# Создать .env файл
cd backend
cp .env.example .env

# Отредактировать .env
nano .env
```

Заполните `.env`:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz  # Ваш токен
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook

# Database
DATABASE_URL=postgresql://pomodoro_user:STRONG_PASSWORD_HERE@localhost:5432/pomodoro_db

# API
API_HOST=0.0.0.0
API_PORT=8000
SECRET_KEY=GENERATE_RANDOM_SECRET_KEY_HERE  # openssl rand -hex 32

# Environment
ENVIRONMENT=production

# Mini App URL
MINI_APP_URL=https://your-domain.com
```

## 🖥️ Шаг 2: Настройка VPS

### 2.1 Подключиться к VPS

```bash
ssh root@YOUR_VPS_IP
```

### 2.2 Запустить setup script

```bash
# Создать временную директорию
mkdir -p /tmp/pomodoro_setup
cd /tmp/pomodoro_setup

# Скачать setup script (или скопировать вручную)
# Если у вас git repo:
# git clone https://github.com/your-repo/time_manager.git
# cd time_manager/backend

# Или загрузить файл
nano setup_vps.sh
# Вставить содержимое из scripts/setup_vps.sh

# Сделать исполняемым и запустить
chmod +x setup_vps.sh
./setup_vps.sh
```

Скрипт установит:
- Python 3.12
- PostgreSQL
- Nginx
- Certbot (для SSL)

### 2.3 Настроить PostgreSQL

```bash
# Создать файл с SQL командами
sudo nano /tmp/setup_db.sql
```

Вставить содержимое `scripts/setup_db.sql` и изменить пароль:

```sql
CREATE USER pomodoro_user WITH PASSWORD 'YOUR_STRONG_PASSWORD';
CREATE DATABASE pomodoro_db OWNER pomodoro_user;
GRANT ALL PRIVILEGES ON DATABASE pomodoro_db TO pomodoro_user;
\c pomodoro_db
GRANT ALL ON SCHEMA public TO pomodoro_user;
```

Выполнить:

```bash
sudo -u postgres psql -f /tmp/setup_db.sql
```

## 📤 Шаг 3: Загрузка кода на VPS

### 3.1 Загрузить backend

```bash
# На локальной машине
cd /path/to/time_manager
rsync -avz --exclude='venv' --exclude='__pycache__' backend/ root@YOUR_VPS_IP:/var/www/pomodoro/backend/
```

### 3.2 Загрузить frontend

```bash
# Загрузить Mini App
rsync -avz --exclude='node_modules' index.html src/ styles/ root@YOUR_VPS_IP:/var/www/pomodoro/frontend/
```

### 3.3 Установить права

```bash
# На VPS
sudo chown -R pomodoro:pomodoro /var/www/pomodoro
```

## 🔧 Шаг 4: Установка приложения

### 4.1 Переключиться на пользователя pomodoro

```bash
sudo su - pomodoro
cd /var/www/pomodoro/backend
```

### 4.2 Запустить установку

```bash
chmod +x scripts/install_app.sh
bash scripts/install_app.sh
```

### 4.3 Проверить .env

```bash
nano .env
# Убедитесь что все настройки корректны!
```

### 4.4 Создать миграции

```bash
source venv/bin/activate
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## 🚀 Шаг 5: Запуск сервисов

### 5.1 Вернуться к root

```bash
exit  # Выйти из пользователя pomodoro
```

### 5.2 Установить systemd services

```bash
cd /var/www/pomodoro/backend
chmod +x scripts/install_services.sh
sudo bash scripts/install_services.sh
```

### 5.3 Запустить сервисы

```bash
# Запустить бота и API
sudo systemctl start pomodoro-bot
sudo systemctl start pomodoro-api

# Проверить статус
sudo systemctl status pomodoro-bot
sudo systemctl status pomodoro-api
```

### 5.4 Проверить логи

```bash
# Логи бота
sudo journalctl -u pomodoro-bot -f

# Логи API
sudo journalctl -u pomodoro-api -f

# Или в файлах
tail -f /var/log/pomodoro/bot.log
tail -f /var/log/pomodoro/api.log
```

## 🌐 Шаг 6: Настройка Nginx

### 6.1 Создать конфигурацию

```bash
sudo nano /etc/nginx/sites-available/pomodoro
```

Вставить содержимое `scripts/nginx.conf` и изменить `your-domain.com` на ваш домен.

### 6.2 Активировать конфигурацию

```bash
# Создать симлинк
sudo ln -s /etc/nginx/sites-available/pomodoro /etc/nginx/sites-enabled/

# Проверить конфигурацию
sudo nginx -t

# Перезапустить Nginx
sudo systemctl restart nginx
```

### 6.3 Получить SSL сертификат

```bash
# Убедитесь что домен указывает на ваш VPS!
sudo certbot --nginx -d your-domain.com

# Следуйте инструкциям certbot
```

## 🎯 Шаг 7: Настройка Telegram Bot

### 7.1 Установить WebApp URL

```bash
# В Telegram найдите @BotFather:
/mybots
# Выберите вашего бота
# Bot Settings > Menu Button > Configure menu button
# Введите URL: https://your-domain.com
```

### 7.2 Настроить команды

```bash
# В @BotFather:
/mybots
# Выберите вашего бота
# Edit Bot > Edit Commands

# Введите:
start - Открыть Pomodoro Timer
stats - Статистика за сегодня
help - Справка
```

## ✅ Шаг 8: Тестирование

### 8.1 Проверить API

```bash
curl https://your-domain.com/api/health
# Должно вернуть: {"status":"ok"}
```

### 8.2 Проверить бота

```
В Telegram:
1. Найдите вашего бота
2. Отправьте /start
3. Должна появиться кнопка "Открыть Pomodoro Timer"
4. Нажмите на кнопку - откроется Mini App
```

### 8.3 Проверить уведомления

```
1. Запустите помодоро в Mini App
2. Дождитесь завершения (или поставьте короткое время для теста)
3. Бот должен отправить уведомление
```

## 🔄 Обновление приложения

```bash
# На локальной машине
cd /path/to/time_manager

# Загрузить изменения
rsync -avz backend/ root@YOUR_VPS_IP:/var/www/pomodoro/backend/
rsync -avz index.html src/ styles/ root@YOUR_VPS_IP:/var/www/pomodoro/frontend/

# На VPS
sudo systemctl restart pomodoro-bot pomodoro-api
```

## 📊 Мониторинг

### Статус сервисов

```bash
sudo systemctl status pomodoro-bot pomodoro-api
```

### Логи

```bash
# Real-time логи бота
sudo journalctl -u pomodoro-bot -f

# Real-time логи API
sudo journalctl -u pomodoro-api -f

# Последние 100 строк
sudo journalctl -u pomodoro-bot -n 100
```

### Проверка базы данных

```bash
sudo -u postgres psql pomodoro_db

# SQL команды:
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM pomodoros;
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
```

## 🐛 Troubleshooting

### Бот не запускается

```bash
# Проверить логи
sudo journalctl -u pomodoro-bot -n 50

# Проверить .env
sudo -u pomodoro cat /var/www/pomodoro/backend/.env

# Проверить что токен правильный
# Проверить подключение к БД
```

### API не работает

```bash
# Проверить что API слушает порт
sudo netstat -tlnp | grep 8000

# Проверить логи
sudo journalctl -u pomodoro-api -n 50

# Тест API напрямую
curl http://localhost:8000/api/health
```

### SSL не работает

```bash
# Проверить сертификаты
sudo certbot certificates

# Обновить сертификаты
sudo certbot renew

# Проверить nginx
sudo nginx -t
sudo systemctl status nginx
```

## 🔐 Безопасность

### Firewall

```bash
# Установить UFW
sudo apt install ufw

# Настроить правила
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS

# Включить
sudo ufw enable
```

### Автоматическое обновление SSL

```bash
# Certbot автоматически настроит cron job
# Проверить:
sudo systemctl status certbot.timer
```

### Бэкапы базы данных

```bash
# Создать скрипт бэкапа
sudo nano /usr/local/bin/backup-pomodoro-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/pomodoro"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump pomodoro_db | gzip > $BACKUP_DIR/pomodoro_db_$DATE.sql.gz

# Удалить старые бэкапы (старше 7 дней)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

```bash
# Сделать исполняемым
sudo chmod +x /usr/local/bin/backup-pomodoro-db.sh

# Добавить в cron (ежедневно в 2:00)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-pomodoro-db.sh
```

## 📞 Поддержка

При проблемах проверьте:
1. Логи сервисов: `sudo journalctl -u pomodoro-bot -f`
2. Nginx логи: `/var/log/nginx/pomodoro-error.log`
3. База данных доступна: `sudo -u postgres psql pomodoro_db`
4. Все сервисы запущены: `sudo systemctl status pomodoro-bot pomodoro-api nginx postgresql`

## 🎉 Готово!

Ваш Pomodoro Bot теперь работает на VPS!

- Mini App: https://your-domain.com
- Bot: @your_bot_username в Telegram
- API: https://your-domain.com/api
