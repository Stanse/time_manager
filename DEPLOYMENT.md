# Развертывание на GitHub Pages

Это руководство описывает два способа развертывания проекта на GitHub Pages.

## Метод 1: Автоматический деплой через GitHub Actions (Рекомендуется)

### Шаг 1: Подготовка репозитория

1. Создайте репозиторий на GitHub (например, `time_manager`)

2. Обновите `base` в `vite.config.js`:
```javascript
base: process.env.NODE_ENV === 'production' ? '/time_manager/' : '/',
```
Замените `time_manager` на название вашего репозитория.

### Шаг 2: Загрузка кода

```bash
# Инициализация git (если еще не сделано)
git init

# Добавить все файлы
git add .

# Первый коммит
git commit -m "Initial commit: refactored architecture"

# Добавить удаленный репозиторий
git remote add origin https://github.com/YOUR_USERNAME/time_manager.git

# Отправить код
git branch -M main
git push -u origin main
```

### Шаг 3: Настройка GitHub Pages

1. Откройте репозиторий на GitHub
2. Перейдите в **Settings** → **Pages**
3. В разделе **Source** выберите:
   - Source: **GitHub Actions**
4. Сохраните настройки

### Шаг 4: Запуск деплоя

GitHub Actions автоматически запустится при пуше в ветку `main`.

Вы можете отслеживать прогресс:
1. Перейдите на вкладку **Actions** в репозитории
2. Выберите последний workflow "Deploy to GitHub Pages"
3. Дождитесь завершения

### Шаг 5: Доступ к приложению

После успешного деплоя приложение будет доступно по адресу:
```
https://YOUR_USERNAME.github.io/time_manager/
```

### Последующие обновления

При каждом пуше в ветку `main` приложение будет автоматически обновляться:

```bash
git add .
git commit -m "Your changes"
git push
```

---

## Метод 2: Ручной деплой с помощью gh-pages

### Шаг 1: Установка зависимостей

```bash
npm install
```

### Шаг 2: Настройка репозитория

Убедитесь, что `base` в `vite.config.js` указан правильно:
```javascript
base: process.env.NODE_ENV === 'production' ? '/time_manager/' : '/',
```

### Шаг 3: Загрузка кода

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/time_manager.git
git push -u origin main
```

### Шаг 4: Деплой

```bash
npm run deploy
```

Эта команда:
1. Соберет проект (`npm run build`)
2. Опубликует содержимое `dist/` в ветку `gh-pages`

### Шаг 5: Настройка GitHub Pages

1. Откройте репозиторий на GitHub
2. Перейдите в **Settings** → **Pages**
3. В разделе **Source** выберите:
   - Source: **Deploy from a branch**
   - Branch: **gh-pages** / **(root)**
4. Сохраните

Приложение будет доступно через несколько минут по адресу:
```
https://YOUR_USERNAME.github.io/time_manager/
```

### Последующие обновления

```bash
git add .
git commit -m "Your changes"
git push
npm run deploy
```

---

## Проверка работоспособности

После деплоя проверьте:

1. ✅ Приложение открывается
2. ✅ Стили загружаются корректно
3. ✅ Можно создавать задачи
4. ✅ Можно запускать/останавливать задачи
5. ✅ Данные сохраняются в localStorage
6. ✅ Debug панель работает

## Решение проблем

### Проблема: Белая страница после деплоя

**Причина**: Неправильный `base` в `vite.config.js`

**Решение**:
1. Проверьте, что `base` соответствует названию репозитория
2. Пересоберите и задеплойте:
```bash
npm run build
npm run deploy  # или git push для GitHub Actions
```

### Проблема: Стили не загружаются (404 ошибки)

**Причина**: Неправильные пути к ассетам

**Решение**:
1. Убедитесь, что в `index.html` используются относительные пути
2. Проверьте `base` в `vite.config.js`
3. Очистите кеш браузера (Ctrl+Shift+R)

### Проблема: GitHub Actions падает с ошибкой

**Причина**: Нет прав на публикацию

**Решение**:
1. Перейдите в Settings → Actions → General
2. В разделе "Workflow permissions" выберите:
   - ✅ Read and write permissions
3. Сохраните и перезапустите workflow

### Проблема: Приложение работает локально, но не на GitHub Pages

**Причина**: Различия в путях или окружении

**Решение**:
1. Проверьте console в браузере (F12)
2. Убедитесь, что `NODE_ENV=production` при сборке
3. Протестируйте локально с preview:
```bash
npm run build
npm run preview
```

## Custom Domain (опционально)

Если у вас есть свой домен:

1. Создайте файл `public/CNAME`:
```
yourdomain.com
```

2. Обновите `vite.config.js`:
```javascript
base: '/',  // для custom domain используйте root
```

3. Настройте DNS записи у вашего провайдера:
```
Type: A
Name: @
Value: 185.199.108.153
       185.199.109.153
       185.199.110.153
       185.199.111.153
```

4. В настройках GitHub Pages укажите custom domain

## Полезные команды

```bash
# Локальная разработка
npm run dev

# Сборка для продакшена
npm run build

# Превью собранного проекта
npm run preview

# Деплой (метод 2)
npm run deploy

# Проверка статуса git
git status

# Просмотр истории коммитов
git log --oneline
```

## Мониторинг деплоя

### GitHub Actions (Метод 1)
- Статус: https://github.com/YOUR_USERNAME/time_manager/actions
- Логи: Кликните на workflow → Выберите job → Смотрите шаги

### gh-pages (Метод 2)
- Проверьте ветку: https://github.com/YOUR_USERNAME/time_manager/tree/gh-pages
- Последний коммит покажет время деплоя

## Telegram WebApp Integration

После деплоя на GitHub Pages, вы можете интегрировать приложение в Telegram:

1. Создайте бота через @BotFather
2. Используйте команду `/newapp`
3. Укажите URL: `https://YOUR_USERNAME.github.io/time_manager/`
4. Приложение будет работать в Telegram с CloudStorage

## Безопасность

- ✅ Никогда не коммитьте `.env` файлы
- ✅ Не храните API ключи в коде
- ✅ Используйте GitHub Secrets для чувствительных данных
- ✅ Регулярно обновляйте зависимости

## Дополнительные ресурсы

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Telegram WebApp Documentation](https://core.telegram.org/bots/webapps)

---

Готово! Ваше приложение теперь доступно онлайн! 🚀
