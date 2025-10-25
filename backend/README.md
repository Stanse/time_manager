# 🍅 Pomodoro Timer Bot - Backend

MVP бот для Telegram с интеграцией Mini App, реализованный на Python 3.12 с использованием паттернов проектирования.

## 📐 Архитектура и паттерны

### Использованные паттерны проектирования:

1. **Singleton** - `Database`, `Settings`
   - Единственный экземпляр на всё приложение
   - `src/database/database.py`, `src/config/settings.py`

2. **Factory** - `Database.get_session()`, `create_app()`
   - Создание объектов (сессий БД, FastAPI app)
   - `src/database/database.py`, `src/api/app.py`

3. **Repository** - `UserService`, `PomodoroService`
   - Абстракция работы с данными
   - `src/services/`

4. **Command + Template Method** - `BaseHandler`
   - Базовый класс для обработчиков команд
   - `src/bot/handlers/base.py`

5. **Facade** - `PomodoroBot`
   - Упрощённый интерфейс для управления ботом
   - `src/bot/bot.py`

6. **Strategy** - `TelegramAuth`
   - Различные стратегии аутентификации
   - `src/api/auth.py`

### Структура проекта:

```
backend/
├── src/
│   ├── api/                    # FastAPI приложение
│   │   ├── app.py             # Главное приложение (Factory)
│   │   ├── routes.py          # API endpoints
│   │   ├── schemas.py         # Pydantic models
│   │   └── auth.py            # Аутентификация (Strategy)
│   ├── bot/                   # Telegram Bot
│   │   ├── bot.py            # Главный класс бота (Facade)
│   │   └── handlers/         # Обработчики команд (Command)
│   │       ├── base.py       # Базовый класс (Template Method)
│   │       ├── start_handler.py
│   │       ├── stats_handler.py
│   │       └── help_handler.py
│   ├── database/             # База данных
│   │   ├── database.py       # Подключение (Singleton, Factory)
│   │   └── models.py         # SQLAlchemy модели
│   ├── services/             # Бизнес-логика (Repository)
│   │   ├── user_service.py
│   │   └── pomodoro_service.py
│   ├── config/               # Конфигурация
│   │   └── settings.py       # Настройки (Singleton)
│   └── utils/                # Утилиты
├── migrations/               # Alembic миграции
├── scripts/                  # Скрипты для развертывания
│   ├── setup_vps.sh         # Настройка VPS
│   ├── install_app.sh       # Установка приложения
│   ├── setup_db.sql         # Настройка PostgreSQL
│   ├── install_services.sh  # Установка systemd
│   ├── pomodoro-bot.service
│   ├── pomodoro-api.service
│   └── nginx.conf           # Конфигурация Nginx
├── requirements.txt          # Python зависимости
├── .env.example             # Пример конфигурации
├── alembic.ini              # Конфигурация Alembic
├── DEPLOYMENT.md            # Инструкция по развертыванию
└── README.md                # Этот файл
```

## 🚀 Функциональность MVP (Фаза 1)

### ✅ Реализовано:

1. **Команда /start**
   - Регистрация пользователя
   - Открытие Mini App

2. **Команда /stats**
   - Статистика за сегодня
   - Статистика за 7 дней
   - Прогресс к дневной цели

3. **Команда /help**
   - Справка по командам
   - Описание техники Pomodoro

4. **API для Mini App:**
   - `POST /api/pomodoro/complete` - запись помодоро
   - `GET /api/stats/today` - статистика за сегодня
   - `GET /api/user` - информация о пользователе
   - `GET /api/health` - проверка здоровья

5. **Уведомления:**
   - Автоматическая отправка уведомлений при завершении помодоро
   - Уведомления о достижении дневной цели

6. **База данных:**
   - PostgreSQL
   - Модели: User, Pomodoro
   - Миграции через Alembic

## 🛠️ Технологии

- **Python 3.12**
- **python-telegram-bot 20.7** - Telegram Bot API
- **FastAPI 0.109** - REST API
- **SQLAlchemy 2.0** - ORM
- **PostgreSQL** - База данных
- **Alembic** - Миграции БД
- **Pydantic** - Валидация данных
- **Uvicorn** - ASGI сервер

## 📦 Установка (локальная разработка)

### Требования:
- Python 3.12+
- PostgreSQL 14+

### Шаги:

```bash
# Клонировать репозиторий
git clone https://github.com/your-repo/time_manager.git
cd time_manager/backend

# Создать виртуальное окружение
python3.12 -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows

# Установить зависимости
pip install -r requirements.txt

# Создать .env
cp .env.example .env
nano .env  # Отредактировать настройки

# Создать базу данных
sudo -u postgres createdb pomodoro_db

# Создать и применить миграции
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head

# Запустить бота
python -m src.bot.bot

# В другом терминале запустить API
python -m src.api.app
```

## 🚀 Развертывание на VPS

Полная инструкция: [DEPLOYMENT.md](./DEPLOYMENT.md)

Краткая версия:

```bash
# 1. На VPS выполнить setup
bash scripts/setup_vps.sh

# 2. Настроить PostgreSQL
sudo -u postgres psql -f scripts/setup_db.sql

# 3. Загрузить код
rsync -avz backend/ user@vps:/var/www/pomodoro/backend/

# 4. Установить приложение
sudo su - pomodoro
bash /var/www/pomodoro/backend/scripts/install_app.sh

# 5. Установить сервисы
sudo bash scripts/install_services.sh
sudo systemctl start pomodoro-bot pomodoro-api

# 6. Настроить Nginx
sudo cp scripts/nginx.conf /etc/nginx/sites-available/pomodoro
sudo ln -s /etc/nginx/sites-available/pomodoro /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# 7. Получить SSL
sudo certbot --nginx -d your-domain.com
```

## 🧪 Тестирование

```bash
# Запустить тесты
pytest

# С покрытием
pytest --cov=src tests/
```

## 📝 Примеры использования

### Создание нового обработчика команды:

```python
# src/bot/handlers/my_handler.py
from src.bot.handlers.base import BaseHandler

class MyHandler(BaseHandler):
    async def execute(self, update, context, session):
        await update.message.reply_text("Hello!")

# В src/bot/bot.py:
from src.bot.handlers.my_handler import MyHandler

self.my_handler = MyHandler()
self.application.add_handler(
    CommandHandler("mycommand", self.my_handler.handle)
)
```

### Добавление нового API endpoint:

```python
# В src/api/routes.py
@router.get("/api/my-endpoint")
async def my_endpoint(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return {"message": "Hello!"}
```

## 🔄 Roadmap (следующие фазы)

### Фаза 2:
- [ ] Ежедневная цель с настройкой
- [ ] Автоматические напоминания
- [ ] Еженедельный отчет

### Фаза 3:
- [ ] Достижения и геймификация
- [ ] Командные комнаты
- [ ] Интеграции (Notion, Todoist)

## 🤝 Contributing

1. Fork проект
2. Создать feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Открыть Pull Request

## 📄 License

MIT License - см. LICENSE файл

## 👨‍💻 Автор

Создано с использованием Claude Code
