# SIMPLE Time Tracker

Современное приложение для отслеживания времени, выполненных задач. Telegram WebApp с чистой архитектурой на основе паттернов проектирования.

## Особенности

- Отслеживание времени для множества задач
- Поддержка Telegram CloudStorage и localStorage
- Чистая модульная архитектура
- Паттерны проектирования (MVC, Observer, Singleton)
- Автосохранение каждые 30 секунд
- Debug панель для разработки
- Адаптивный дизайн

## Архитектура проекта

```
src/
├── models/           # Модели данных
│   ├── Task.js      # Модель задачи
│   └── TaskList.js  # Модель списка задач (Observable)
├── views/           # Представления
│   ├── BaseView.js  # Базовый класс для всех View
│   ├── TaskListView.js
│   ├── ModalView.js
│   ├── HeaderView.js
│   └── DebugView.js
├── controllers/     # Контроллеры
│   └── AppController.js  # Главный контроллер приложения
├── services/        # Сервисы
│   ├── StorageService.js  # Singleton для работы с хранилищем
│   └── TaskService.js     # Singleton для бизнес-логики
├── utils/           # Утилиты
│   ├── EventEmitter.js    # Observer pattern
│   ├── TimeFormatter.js   # Форматирование времени
│   └── Logger.js          # Singleton для логирования
├── styles/          # Стили (модульные CSS)
│   ├── base.css
│   ├── header.css
│   ├── tasks.css
│   ├── buttons.css
│   ├── modal.css
│   ├── debug.css
│   ├── animations.css
│   └── index.css    # Главный файл стилей
└── main.js          # Точка входа

```

## Используемые паттерны проектирования

### 1. MVC (Model-View-Controller)
- **Models**: `Task`, `TaskList` - управление данными
- **Views**: `TaskListView`, `ModalView`, `HeaderView` - отображение UI
- **Controllers**: `AppController` - координация между моделями и представлениями

### 2. Observer (Наблюдатель)
- `EventEmitter` - базовая реализация паттерна
- `TaskList` расширяет `EventEmitter` и генерирует события при изменениях
- Views подписываются на события моделей

```javascript
// Пример использования
taskList.on('taskAdded', ({ task }) => {
  console.log('Задача добавлена:', task.name);
});
```

### 3. Singleton (Одиночка)
- `Logger` - единственный экземпляр логгера
- `StorageService` - единственный экземпляр сервиса хранилища
- `TaskService` - единственный экземпляр сервиса задач

```javascript
// Пример использования
const logger = Logger.getInstance();
const storage = StorageService.getInstance();
```

## Установка и запуск

### Установка зависимостей

```bash
npm install
```

### Режим разработки

```bash
npm run dev
```

Приложение откроется на `http://localhost:3000`

### Сборка для продакшена

```bash
npm run build
```

Собранные файлы будут в директории `dist/`

### Превью сборки

```bash
npm run preview
```

## Структура данных

### Task (Задача)

```javascript
{
  id: string,           // Уникальный ID
  name: string,         // Название задачи
  totalTime: number,    // Общее время в секундах
  startTime: number|null // Timestamp начала или null
}
```

### TaskList (Список задач)

```javascript
{
  tasks: Task[],        // Массив задач
  activeTaskId: string|null // ID активной задачи
}
```

## API классов

### Task

```javascript
// Создание новой задачи
const task = Task.create('Моя задача');

// Проверка статуса
task.isRunning(); // boolean

// Управление задачей
task.start();     // Запустить
task.stop();      // Остановить

// Получить текущее время
task.getCurrentTime(); // number (секунды)

// Переименовать
task.rename('Новое имя');

// Сериализация
task.toJSON();
Task.fromJSON(data);
```

### TaskList

```javascript
const taskList = new TaskList();

// Управление задачами
taskList.addTask(task);
taskList.removeTask(taskId);
taskList.getTask(taskId);
taskList.getAllTasks();

// Управление активной задачей
taskList.startTask(taskId);
taskList.stopTask(taskId);
taskList.toggleTask(taskId);

// Обновление
taskList.updateTaskName(taskId, newName);

// Статистика
taskList.getTotalTime(); // Общее время всех задач

// События
taskList.on('taskAdded', callback);
taskList.on('taskRemoved', callback);
taskList.on('taskStarted', callback);
taskList.on('taskStopped', callback);
taskList.on('changed', callback);
```

### TaskService

```javascript
const taskService = TaskService.getInstance();

// Инициализация (загрузка из storage)
await taskService.initialize();

// CRUD операции
await taskService.createTask('Название');
await taskService.updateTask(taskId, newName);
await taskService.deleteTask(taskId);

// Управление задачами
taskService.startTask(taskId);
await taskService.stopTask(taskId);
taskService.toggleTask(taskId);

// Доступ к TaskList
const taskList = taskService.getTaskList();
```

### StorageService

```javascript
const storage = StorageService.getInstance();

// Работа с хранилищем (async)
await storage.get('key');
await storage.set('key', 'value');
await storage.remove('key');
await storage.clear();
```

### Logger

```javascript
const logger = Logger.getInstance();

// Включить/выключить
logger.enable();
logger.disable();

// Логирование
logger.log('Сообщение');
logger.error('Ошибка');
logger.warn('Предупреждение');
logger.info('Информация');

// Подписка на события логов
logger.onLog((log) => {
  console.log(log.message, log.type);
});

// Очистка
logger.clear();
```

## Добавление нового функционала

### Пример: Добавление категорий для задач

#### 1. Обновить модель Task

```javascript
// src/models/Task.js
constructor({ id, name, totalTime = 0, startTime = null, category = 'default' }) {
  this.id = id;
  this.name = name;
  this.totalTime = totalTime;
  this.startTime = startTime;
  this.category = category; // Новое поле
}
```

#### 2. Добавить метод в TaskService

```javascript
// src/services/TaskService.js
async updateTaskCategory(taskId, category) {
  const task = this.taskList.getTask(taskId);
  if (task) {
    task.category = category;
    this.taskList.emit('taskUpdated', { task });
    await this.saveTasks();
  }
}
```

#### 3. Обновить View

```javascript
// src/views/TaskListView.js
renderTask(task, isActive) {
  // Добавить отображение категории
  const categoryBadge = `<span class="category-badge">${task.category}</span>`;
  // ...
}
```

#### 4. Добавить CSS

```css
/* src/styles/tasks.css */
.category-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #e0e0e0;
}
```

## Отладка

### Включение Debug режима

1. Нажмите на кнопку 🐛 в правом нижнем углу
2. Debug панель покажет все логи в реальном времени
3. Все console.log/error/warn будут отображаться в панели

### Доступ к приложению из консоли

```javascript
// Приложение доступно глобально
window.app

// Примеры использования
window.app.taskService.getTaskList().getAllTasks();
window.app.render();
```

## Telegram WebApp Integration

Приложение автоматически определяет окружение Telegram и использует:
- `Telegram.WebApp.CloudStorage` для хранения данных
- `Telegram.WebApp.platform` для определения платформы
- Lifecycle events для автосохранения

### Fallback на localStorage

Если Telegram WebApp API недоступен, приложение автоматически использует localStorage.

## Производительность

- Автосохранение каждые 30 секунд (только если задача активна)
- Оптимизированный рендеринг (перерисовка только при изменениях)
- Ленивая загрузка интервалов (создаются только для активных задач)

## Совместимость

- Современные браузеры (Chrome, Firefox, Safari, Edge)
- Telegram WebApp (iOS, Android, Desktop)
- Mobile-first дизайн

## Лицензия

MIT

## Автор

SIMPLE Time Tracker Team
