# 🚀 Быстрый гид по деплою

## Первоначальная настройка (один раз)

### 1. Создайте репозиторий на GitHub
- Перейдите на https://github.com/new
- Название: `time_manager` (или любое другое)
- Оставьте пустым (не добавляйте README)
- Нажмите "Create repository"

### 2. Обновите vite.config.js

Откройте `vite.config.js` и измените строку:
```javascript
base: process.env.NODE_ENV === 'production' ? '/ВАШ_РЕПОЗИТОРИЙ/' : '/',
```

Замените `ВАШ_РЕПОЗИТОРИЙ` на название вашего репозитория.

### 3. Выполните команды

```bash
# Установить зависимостиsw
npm install

# Инициализировать git
git init

# Добавить все файлы
git add .

# Создать коммит
git commit -m "Initial commit: refactored time tracker"

# Добавить удаленный репозиторий (замените YOUR_USERNAME и REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Отправить код
git branch -M main
git push -u origin main
```

### 4. Включите GitHub Pages

1. Откройте ваш репозиторий на GitHub
2. **Settings** → **Pages**
3. Source: **GitHub Actions**
4. Сохраните

### 5. Дождитесь деплоя

- Перейдите на вкладку **Actions**
- Дождитесь зеленой галочки ✅
- Ваше приложение будет доступно: `https://YOUR_USERNAME.github.io/REPO_NAME/`

---

## Повседневная работа

### Внесение изменений

```bash
# 1. Проверить статус
git status

# 2. Добавить измененные файлы
git add .

# 3. Создать коммит
git commit -m "Описание изменений"

# 4. Отправить на GitHub (автоматический деплой запустится)
git push
```

### Полный цикл разработки

```bash
# Разработка
npm run dev          # Запустить dev сервер (localhost:3000)

# Тестирование
npm run build        # Собрать проект
npm run preview      # Протестировать сборку

# Деплой
git add .
git commit -m "feat: добавлена новая функция"
git push             # Автоматический деплой через GitHub Actions
```

---

## Команды Git

### Основные

```bash
# Посмотреть статус
git status

# Посмотреть изменения
git diff

# История коммитов
git log --oneline

# Добавить файлы
git add .                    # Все файлы
git add src/models/Task.js   # Конкретный файл

# Коммит
git commit -m "Сообщение"

# Отправить на GitHub
git push

# Получить изменения
git pull
```

### Ветки

```bash
# Создать новую ветку
git checkout -b feature/new-feature

# Переключиться на ветку
git checkout main

# Список веток
git branch

# Удалить ветку
git branch -d feature/old-feature
```

### Отмена изменений

```bash
# Отменить изменения в файле (до add)
git checkout -- filename

# Убрать файл из staging (после add)
git reset HEAD filename

# Отменить последний коммит (сохранив изменения)
git reset --soft HEAD~1

# Отменить последний коммит (удалив изменения)
git reset --hard HEAD~1
```

---

## Типичные сценарии

### Сценарий 1: Добавил новую функцию

```bash
# 1. Убедитесь, что все работает локально
npm run dev

# 2. Проверьте, что нет ошибок при сборке
npm run build

# 3. Коммит и пуш
git add .
git commit -m "feat: добавлена категоризация задач"
git push
```

### Сценарий 2: Исправил баг

```bash
git add .
git commit -m "fix: исправлена ошибка в сохранении времени"
git push
```

### Сценарий 3: Обновил документацию

```bash
git add README.md
git commit -m "docs: обновлена документация"
git push
```

### Сценарий 4: Рефакторинг кода

```bash
git add .
git commit -m "refactor: улучшена структура TaskService"
git push
```

---

## Стиль коммитов

Используйте префиксы для ясности:

- `feat:` - новая функция
- `fix:` - исправление бага
- `docs:` - изменения в документации
- `style:` - форматирование, отступы
- `refactor:` - рефакторинг кода
- `test:` - добавление тестов
- `chore:` - обновление зависимостей

**Примеры:**
```bash
git commit -m "feat: add export to CSV functionality"
git commit -m "fix: resolve timer sync issue"
git commit -m "docs: update deployment guide"
git commit -m "refactor: extract TimeFormatter to utils"
```

---

## Проверка деплоя

### Где смотреть статус

1. **GitHub Actions**
   - https://github.com/YOUR_USERNAME/REPO_NAME/actions
   - Зеленая галочка = успех ✅
   - Красный крестик = ошибка ❌

2. **GitHub Pages настройки**
   - Settings → Pages
   - Покажет текущий URL и статус

### Если что-то пошло не так

```bash
# Посмотреть логи в Actions на GitHub
# Или запустить локально:

npm run build
# Проверьте на ошибки сборки

npm run preview
# Откроется localhost:4173
# Проверьте, работает ли приложение
```

---

## Быстрая справка по npm

```bash
npm install              # Установить зависимости
npm run dev             # Запустить dev сервер
npm run build           # Собрать проект
npm run preview         # Превью сборки
npm run deploy          # Ручной деплой (gh-pages)
npm list                # Список установленных пакетов
npm outdated            # Проверить устаревшие пакеты
npm update              # Обновить пакеты
```

---

## Telegram Bot интеграция

После успешного деплоя:

1. Найдите @BotFather в Telegram
2. Отправьте `/newapp`
3. Выберите вашего бота
4. Укажите название приложения
5. Описание
6. Фото (512x512 px)
7. GIF/Video демонстрация
8. **Web App URL**: `https://YOUR_USERNAME.github.io/REPO_NAME/`

Готово! Приложение доступно в Telegram 🎉

---

## Частые вопросы

**Q: Как узнать, что деплой прошел успешно?**
A: GitHub Actions покажет зеленую галочку, и приложение откроется по ссылке.

**Q: Сколько времени занимает деплой?**
A: Обычно 1-3 минуты.

**Q: Могу ли я откатить изменения?**
A: Да, используйте `git revert` или откатитесь к предыдущему коммиту.

**Q: Данные пользователей удалятся после деплоя?**
A: Нет, данные хранятся в браузере (localStorage/CloudStorage).

**Q: Можно ли использовать свой домен?**
A: Да! Создайте файл `public/CNAME` и настройте DNS.

---

## Полезные ссылки

- 📖 [Полная документация](./README.md)
- 🏗️ [Архитектура проекта](./ARCHITECTURE.md)
- 💡 [Примеры расширения](./EXAMPLES.md)
- 🚀 [Подробный гид по деплою](./DEPLOYMENT.md)

---

**Поздравляем! Теперь вы знаете, как развернуть проект на GitHub Pages! 🎊**
