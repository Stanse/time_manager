# Решение проблем (Troubleshooting)

## GitHub Actions

### ❌ Ошибка: "Dependencies lock file is not found"

**Симптомы:**
```
Error: Dependencies lock file is not found in /home/runner/work/time_manager/time_manager.
Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
```

**Причина:**
GitHub Actions не может найти `package-lock.json` для кэширования зависимостей.

**Решение:**

**Вариант 1: Добавить package-lock.json (Рекомендуется)**
```bash
# Сгенерировать package-lock.json
npm install

# Закоммитить и запушить
git add package-lock.json
git commit -m "fix: add package-lock.json for GitHub Actions"
git push
```

**Вариант 2: Отключить кэширование в GitHub Actions**

Обновите `.github/workflows/deploy.yml`:
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    # cache: 'npm'  ← Закомментируйте или удалите эту строку

- name: Install dependencies
  run: npm install  # Используйте npm install вместо npm ci
```

---

## Vite

### ❌ Белая страница после деплоя / Только HTML без стилей и логики

**Симптомы:**
- Приложение работает локально (`npm run dev`)
- После деплоя на GitHub Pages - только HTML разметка на белом фоне
- Стили не применяются, JavaScript не работает
- В консоли браузера (F12) ошибки 404 на файлы `.js` и `.css`

**Причина:**
Неправильная конфигурация `base` path в `vite.config.js`. Vite не может определить production режим через `process.env.NODE_ENV`.

**Решение:**

Обновите `vite.config.js` на правильную конфигурацию:

```javascript
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  // command === 'build' в production, 'serve' в dev
  const base = command === 'build' ? '/ИМЯ_РЕПОЗИТОРИЯ/' : '/';

  return {
    base,
    root: '.',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: './index.html'
        }
      }
    },
    server: {
      port: 3000,
      open: true
    }
  };
});
```

**Важно:** Замените `ИМЯ_РЕПОЗИТОРИЯ` на реальное название вашего репозитория!

**Пример:**
- Репозиторий: `https://github.com/username/time-tracker`
- base должен быть: `'/time-tracker/'`

Затем пересоберите и задеплойте:
```bash
npm run build   # Проверить, что сборка работает
git add vite.config.js
git commit -m "fix: correct base path configuration for GitHub Pages"
git push
```

**Проверка:**
После пуша откройте консоль браузера (F12) на странице GitHub Pages:
- ✅ Не должно быть ошибок 404
- ✅ Файлы должны загружаться из `/ИМЯ_РЕПОЗИТОРИЯ/assets/...`

### ❌ Ошибка при сборке: "Cannot find module"

**Симптомы:**
```
Error: Cannot find module './models/Task.js'
```

**Причина:**
- Неправильный путь импорта
- Отсутствует расширение `.js`
- Регистр букв не совпадает (Windows vs Linux)

**Решение:**

1. Проверьте импорты - всегда указывайте расширение:
```javascript
// ❌ Неправильно
import { Task } from './models/Task'

// ✅ Правильно
import { Task } from './models/Task.js'
```

2. Проверьте регистр букв (важно для Linux):
```javascript
// Если файл называется Task.js (с большой T)
import { Task } from './models/Task.js'  // ✅ Правильно
import { Task } from './models/task.js'  // ❌ Не работает на Linux
```

---

## Git

### ❌ Конфликт при push

**Симптомы:**
```
! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'https://github.com/...'
```

**Решение:**
```bash
# Получить изменения с сервера
git pull --rebase origin main

# Если есть конфликты - разрешить их
# Затем продолжить
git rebase --continue

# Запушить
git push
```

### ❌ Случайно закоммитили node_modules

**Решение:**
```bash
# Удалить из git, но оставить локально
git rm -r --cached node_modules

# Убедиться, что node_modules в .gitignore
echo "node_modules/" >> .gitignore

# Закоммитить
git add .gitignore
git commit -m "fix: remove node_modules from git"
git push
```

### ❌ Нужно отменить последний коммит

**Решение:**
```bash
# Отменить коммит, сохранив изменения
git reset --soft HEAD~1

# Отменить коммит и все изменения
git reset --hard HEAD~1

# Если уже запушили - создать revert коммит
git revert HEAD
git push
```

---

## npm

### ❌ Ошибка при npm install

**Симптомы:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Решение:**
```bash
# Очистить кэш npm
npm cache clean --force

# Удалить node_modules и package-lock.json
rm -rf node_modules package-lock.json

# Установить заново
npm install

# Если не помогло - использовать --legacy-peer-deps
npm install --legacy-peer-deps
```

### ❌ npm run dev не работает

**Симптомы:**
- Порт 3000 уже занят
- Ошибка EADDRINUSE

**Решение 1: Изменить порт**
```javascript
// vite.config.js
server: {
  port: 3001,  // Измените на свободный порт
  open: true
}
```

**Решение 2: Убить процесс на порту 3000**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

---

## GitHub Pages

### ❌ 404 после деплоя

**Симптомы:**
- GitHub Actions прошел успешно
- Но страница показывает 404

**Решение:**

1. Проверьте настройки GitHub Pages:
   - Settings → Pages
   - Source должен быть: **GitHub Actions**

2. Проверьте, что деплой завершен:
   - Actions → последний workflow должен быть зеленым ✅

3. Подождите 1-2 минуты для распространения изменений

4. Очистите кэш браузера (Ctrl+Shift+R)

### ❌ Стили не применяются

**Симптомы:**
- Приложение открывается, но без стилей
- В консоли ошибки 404 на CSS файлы

**Причина:**
Неправильный `base` path в vite.config.js

**Решение:**
См. раздел "Белая страница после деплоя" выше

---

## Telegram WebApp

### ❌ CloudStorage не работает

**Симптомы:**
- Приложение не сохраняет данные в Telegram
- Используется только localStorage

**Решение:**

1. Проверьте в консоли:
```javascript
console.log(window.Telegram?.WebApp?.CloudStorage);
// Должно вернуть объект, не undefined
```

2. Убедитесь, что приложение открыто в Telegram:
   - Используйте @BotFather для создания WebApp
   - Откройте через Telegram, а не напрямую в браузере

3. Для тестирования локально используется localStorage (это нормально)

### ❌ Приложение не открывается в Telegram

**Решение:**

1. Проверьте HTTPS:
   - GitHub Pages автоматически использует HTTPS ✅
   - Localhost не требует HTTPS для разработки ✅

2. Проверьте URL в @BotFather:
   - Должен быть полный URL с https://
   - Должен заканчиваться на `/` (слеш важен!)

3. Пример правильного URL:
```
https://username.github.io/time_manager/
```

---

## Производительность

### ❌ Приложение тормозит

**Решение:**

1. Откройте DevTools (F12) → Performance
2. Запишите профиль во время использования
3. Найдите bottleneck

**Частые причины:**
- Слишком много console.log в продакшене
  - Решение: Удалите или используйте logger только в dev режиме

- Intervals не очищаются
  - Решение: Проверьте, что clearInterval вызывается

- Частые перерисовки
  - Решение: Оптимизируйте Observer подписки

---

## Быстрая диагностика

### Чеклист для проверки

```bash
# 1. Локальная разработка работает?
npm run dev
# → Должно открыться на localhost:3000

# 2. Сборка проходит без ошибок?
npm run build
# → Должна создаться папка dist/

# 3. Превью сборки работает?
npm run preview
# → Должно открыться на localhost:4173

# 4. Git статус чистый?
git status
# → Нет uncommitted changes

# 5. GitHub Actions успешен?
# → Зайдите на github.com → Actions → должен быть ✅
```

### Если всё сломалось

```bash
# Полная переустановка
rm -rf node_modules package-lock.json
npm install
npm run dev

# Если и это не помогло
git stash  # Сохранить изменения
git pull   # Получить последнюю версию
git stash pop  # Вернуть изменения
npm install
npm run dev
```

---

## Получение помощи

1. **Проверьте документацию:**
   - README.md
   - ARCHITECTURE.md
   - EXAMPLES.md

2. **Посмотрите логи:**
   - GitHub Actions: Actions → выберите workflow → смотрите логи
   - Browser: F12 → Console
   - npm: читайте полный вывод ошибки

3. **Изучите код:**
   - Код хорошо документирован комментариями
   - Используйте Debug панель (🐛 кнопка)

4. **Создайте Issue:**
   - Опишите проблему
   - Приложите скриншот ошибки
   - Укажите шаги для воспроизведения

---

**Большинство проблем решаются одним из решений выше! 🎯**
