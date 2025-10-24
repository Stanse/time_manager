# Quick Start Guide

Быстрое руководство для начала работы с проектом.

## Установка

```bash
# 1. Установить зависимости
npm install

# 2. Запустить dev сервер
npm run dev
```

Приложение откроется на `http://localhost:3000`

## Структура проекта

```
time_manager/
├── src/
│   ├── controllers/    # Контроллеры (координация)
│   ├── models/         # Модели данных
│   ├── views/          # UI компоненты
│   ├── services/       # Бизнес-логика
│   ├── utils/          # Утилиты
│   ├── styles/         # CSS модули
│   └── main.js         # Точка входа
├── index.html          # HTML шаблон
├── package.json        # Конфигурация проекта
└── vite.config.js      # Конфигурация сборки
```

## Основные концепции

### 1. Models (Модели)

**Task** - одна задача
```javascript
import { Task } from './models/Task.js';

const task = Task.create('Моя задача');
task.start();
task.stop();
console.log(task.getCurrentTime()); // секунды
```

**TaskList** - коллекция задач (Observable)
```javascript
import { TaskList } from './models/TaskList.js';

const taskList = new TaskList();
taskList.addTask(task);

// Подписка на события
taskList.on('taskAdded', ({ task }) => {
  console.log('Задача добавлена:', task.name);
});
```

### 2. Services (Сервисы)

**TaskService** - управление задачами
```javascript
import { taskService } from './services/TaskService.js';

await taskService.initialize();
await taskService.createTask('Новая задача');
taskService.toggleTask(taskId);
```

**StorageService** - хранилище
```javascript
import { storage } from './services/StorageService.js';

await storage.set('key', 'value');
const value = await storage.get('key');
```

### 3. Views (Представления)

Все Views наследуются от `BaseView`:
```javascript
import { BaseView } from './views/BaseView.js';

class MyView extends BaseView {
  render(data) {
    this.setContent(`<div>${data}</div>`);
  }
}
```

### 4. Controllers (Контроллеры)

**AppController** - главный контроллер
```javascript
import { AppController } from './controllers/AppController.js';

const app = new AppController();
await app.initialize();
```

## Паттерны проектирования

### Observer Pattern (Наблюдатель)

```javascript
import { EventEmitter } from './utils/EventEmitter.js';

class MyClass extends EventEmitter {
  doSomething() {
    this.emit('something', { data: 'value' });
  }
}

const obj = new MyClass();
obj.on('something', ({ data }) => {
  console.log('Event:', data);
});
```

### Singleton Pattern (Одиночка)

```javascript
class MyService {
  static instance = null;

  static getInstance() {
    if (!MyService.instance) {
      MyService.instance = new MyService();
    }
    return MyService.instance;
  }
}

const service = MyService.getInstance();
```

## Добавление функционала

### Пример: Добавить поле описания к задаче

**1. Обновить модель**
```javascript
// src/models/Task.js
constructor({ id, name, totalTime = 0, startTime = null, description = '' }) {
  // ...
  this.description = description;
}
```

**2. Обновить сервис**
```javascript
// src/services/TaskService.js
async updateTaskDescription(taskId, description) {
  const task = this.taskList.getTask(taskId);
  if (task) {
    task.description = description;
    await this.saveTasks();
  }
}
```

**3. Обновить View**
```javascript
// src/views/TaskListView.js
renderTask(task, isActive) {
  // Добавить отображение description
  taskDiv.innerHTML = `
    <div class="task-name">${task.name}</div>
    <div class="task-description">${task.description}</div>
    <!-- ... -->
  `;
}
```

**4. Добавить CSS**
```css
/* src/styles/tasks.css */
.task-description {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
```

## Отладка

### Включить Debug панель

1. Нажать кнопку 🐛 в правом нижнем углу
2. Все логи будут показываться в реальном времени

### Использование Logger

```javascript
import { logger } from './utils/Logger.js';

logger.log('Информация');
logger.error('Ошибка');
logger.warn('Предупреждение');
logger.info('Инфо');
```

### Доступ через консоль

```javascript
// Приложение доступно глобально
window.app

// Примеры
window.app.taskService.getTaskList().getAllTasks();
window.app.render();
```

## Сборка для продакшена

```bash
# Собрать проект
npm run build

# Файлы будут в директории dist/
# Загрузить dist/ на хостинг
```

## Telegram WebApp

Приложение автоматически работает с Telegram:
- Использует `CloudStorage` для хранения
- Fallback на `localStorage`
- Поддержка lifecycle events

## Команды

```bash
npm run dev      # Запуск dev сервера
npm run build    # Сборка для продакшена
npm run preview  # Превью собранного проекта
```

## Полезные ссылки

- [README.md](./README.md) - Полная документация
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Описание архитектуры
- [EXAMPLES.md](./EXAMPLES.md) - Примеры расширения

## Следующие шаги

1. Изучить структуру проекта
2. Прочитать код моделей в `src/models/`
3. Посмотреть примеры в `EXAMPLES.md`
4. Добавить свой функционал!

## Помощь

Если возникли вопросы:
1. Проверьте документацию в `README.md`
2. Посмотрите примеры в `EXAMPLES.md`
3. Изучите код - он хорошо документирован!

Happy coding! 🚀
