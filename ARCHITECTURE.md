# Архитектура приложения

## Обзор

SIMPLE Time Tracker построен на основе чистой архитектуры с использованием классических паттернов проектирования.

## Диаграмма слоёв

```
┌─────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                       │
│                         (index.html)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                        CONTROLLERS                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              AppController                           │   │
│  │  • Координирует Views и Services                    │   │
│  │  • Обрабатывает UI события                          │   │
│  │  • Связывает слои приложения                        │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
               ↓                          ↓
┌──────────────────────────┐   ┌────────────────────────────┐
│        VIEWS             │   │       SERVICES             │
│  ┌──────────────────┐   │   │  ┌───────────────────┐    │
│  │  TaskListView    │   │   │  │  TaskService      │    │
│  │  ModalView       │   │   │  │  (Singleton)      │    │
│  │  HeaderView      │   │   │  │  • Бизнес-логика  │    │
│  │  DebugView       │   │   │  │  • CRUD операции  │    │
│  └──────────────────┘   │   │  └────────┬──────────┘    │
│                          │   │           │                │
│  • Отображение данных   │   │  ┌────────▼──────────┐    │
│  • UI компоненты        │   │  │  StorageService   │    │
│  • События              │   │  │  (Singleton)      │    │
└──────────────────────────┘   │  │  • Telegram Cloud │    │
                               │  │  • localStorage   │    │
                               │  └───────────────────┘    │
                               └────────────┬───────────────┘
                                            │
                                            ↓
                               ┌────────────────────────────┐
                               │        MODELS              │
                               │  ┌───────────────────┐    │
                               │  │  TaskList         │    │
                               │  │  (Observable)     │    │
                               │  │  • Управление     │    │
                               │  │    коллекцией     │    │
                               │  │  • События        │    │
                               │  └────────┬──────────┘    │
                               │           │                │
                               │  ┌────────▼──────────┐    │
                               │  │  Task             │    │
                               │  │  • Данные задачи  │    │
                               │  │  • Бизнес-правила │    │
                               │  └───────────────────┘    │
                               └────────────────────────────┘
                                            ↑
                                            │
                               ┌────────────┴───────────────┐
                               │        UTILITIES           │
                               │  • EventEmitter (Observer) │
                               │  • Logger (Singleton)      │
                               │  • TimeFormatter           │
                               └────────────────────────────┘
```

## Поток данных

### 1. Загрузка приложения

```
main.js → AppController.initialize()
    ↓
TaskService.initialize()
    ↓
StorageService.get('tasks')
    ↓
TaskList.fromJSON(data)
    ↓
AppController.render()
    ↓
TaskListView.render(tasks)
```

### 2. Создание задачи

```
User clicks "NEW TASK"
    ↓
AppController.handleNewTask()
    ↓
ModalView.openCreate()
    ↓
User enters name → clicks "Create"
    ↓
AppController.handleModalSubmit()
    ↓
TaskService.createTask(name)
    ↓
Task.create(name)
    ↓
TaskList.addTask(task)
    ↓
TaskList.emit('taskAdded')
    ↓
TaskService.saveTasks()
    ↓
StorageService.set('tasks', data)
    ↓
AppController.render() (через subscription)
```

### 3. Запуск задачи

```
User clicks "START"
    ↓
AppController.handleToggleTask(taskId)
    ↓
TaskService.toggleTask(taskId)
    ↓
TaskList.startTask(taskId)
    ↓
Task.start()
    ↓
TaskList.emit('taskStarted')
    ↓
AppController.render() (через subscription)
    ↓
TaskListView.animateTask('starting')
```

## Паттерны проектирования

### 1. MVC (Model-View-Controller)

**Model** - Управление данными и бизнес-логикой
- `Task` - модель одной задачи
- `TaskList` - коллекция задач

**View** - Отображение и UI
- `TaskListView` - список задач
- `ModalView` - модальное окно
- `HeaderView` - заголовок
- `DebugView` - debug панель

**Controller** - Координация
- `AppController` - главный контроллер

**Преимущества**:
- Разделение ответственности
- Независимое тестирование
- Переиспользование компонентов

### 2. Observer (Наблюдатель)

**Реализация**: `EventEmitter`

```javascript
// TaskList - Subject
class TaskList extends EventEmitter {
  addTask(task) {
    this.tasks.push(task);
    this.emit('taskAdded', { task }); // Уведомление наблюдателей
  }
}

// AppController - Observer
taskList.on('taskAdded', ({ task }) => {
  this.render(); // Реакция на событие
});
```

**Преимущества**:
- Слабая связанность
- Реактивное обновление UI
- Множественные подписчики

### 3. Singleton (Одиночка)

**Реализация**: Services и Logger

```javascript
class TaskService {
  static instance = null;

  constructor() {
    if (TaskService.instance) {
      return TaskService.instance;
    }
    TaskService.instance = this;
  }

  static getInstance() {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }
}
```

**Используется в**:
- `TaskService` - единый экземпляр для управления задачами
- `StorageService` - единый доступ к хранилищу
- `Logger` - централизованное логирование

**Преимущества**:
- Контролируемый глобальный доступ
- Единое состояние
- Ленивая инициализация

### 4. Factory (Фабрика)

**Реализация**: Создание задач

```javascript
class Task {
  static create(name) {
    return new Task({
      id: Date.now().toString(),
      name,
      totalTime: 0,
      startTime: null
    });
  }
}
```

**Преимущества**:
- Инкапсуляция создания
- Валидация при создании
- Единая точка создания объектов

## Принципы SOLID

### Single Responsibility (Единая ответственность)

✅ Каждый класс имеет одну ответственность:
- `Task` - управление данными задачи
- `TaskService` - бизнес-логика задач
- `StorageService` - работа с хранилищем
- `TaskListView` - отображение списка

### Open/Closed (Открыт/Закрыт)

✅ Легко расширяется без изменения существующего кода:
- Новые Views расширяют `BaseView`
- Новые события через `EventEmitter`
- Новые методы в Services не ломают существующие

### Liskov Substitution (Подстановка Барбары Лисков)

✅ Все Views могут заменять `BaseView`:
```javascript
function renderView(view: BaseView) {
  view.show();
  view.render();
}
```

### Interface Segregation (Разделение интерфейса)

✅ Классы не зависят от неиспользуемых методов:
- Views имеют минимальный интерфейс
- Services предоставляют специфичные методы

### Dependency Inversion (Инверсия зависимостей)

✅ Зависимости от абстракций:
- Controller зависит от Service интерфейса, а не реализации
- Views зависят от событий, а не конкретных моделей

## Расширяемость

### Добавление нового функционала

1. **Новое свойство модели**:
   - Обновить `Task` конструктор
   - Добавить в `toJSON()`/`fromJSON()`

2. **Новая бизнес-логика**:
   - Добавить метод в `TaskService`
   - При необходимости emit события

3. **Новый UI элемент**:
   - Создать новый View (extends BaseView)
   - Добавить обработчик в Controller

4. **Новый сервис**:
   - Создать класс с getInstance()
   - Использовать в Service слое

### Пример добавления фильтрации

```javascript
// 1. Добавить в TaskList
class TaskList {
  filterByName(query) {
    return this.tasks.filter(t =>
      t.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// 2. Добавить View для поиска
class SearchView extends BaseView {
  render() {
    this.setContent(`<input type="text" id="searchInput" />`);
  }
}

// 3. Добавить в Controller
class AppController {
  setupEventListeners() {
    document.getElementById('searchInput')
      .addEventListener('input', (e) => this.handleSearch(e.target.value));
  }

  handleSearch(query) {
    const filtered = this.taskList.filterByName(query);
    this.taskListView.render(filtered, this.taskList.activeTaskId);
  }
}
```

## Тестирование

Архитектура позволяет легко тестировать:

### Unit тесты

```javascript
// Тестирование модели
describe('Task', () => {
  it('should start and stop', () => {
    const task = Task.create('Test');
    task.start();
    expect(task.isRunning()).toBe(true);
    task.stop();
    expect(task.isRunning()).toBe(false);
  });
});

// Тестирование сервиса (с моками)
describe('TaskService', () => {
  it('should create task', async () => {
    const mockStorage = { set: jest.fn() };
    const service = new TaskService(mockStorage);
    await service.createTask('Test');
    expect(mockStorage.set).toHaveBeenCalled();
  });
});
```

### Integration тесты

```javascript
describe('Task Creation Flow', () => {
  it('should create and render task', async () => {
    const controller = new AppController();
    await controller.initialize();

    // Симуляция создания задачи
    await controller.taskService.createTask('Test Task');

    // Проверка отображения
    const taskElements = document.querySelectorAll('.task-item');
    expect(taskElements.length).toBe(1);
  });
});
```

## Производительность

### Оптимизации

1. **Ленивая инициализация**:
   - Singletons создаются при первом использовании
   - Intervals создаются только для активных задач

2. **Минимальные перерисовки**:
   - Render вызывается только при изменении данных
   - События подписываются через Observer

3. **Batch операции**:
   - Автосохранение раз в 30 секунд
   - Группировка DOM операций

4. **Memory management**:
   - Cleanup intervals при unmount
   - Ограничение логов (max 100)

## Заключение

Архитектура проекта обеспечивает:
- ✅ Модульность и переиспользование
- ✅ Легкое тестирование
- ✅ Простое расширение
- ✅ Чистый и понятный код
- ✅ Разделение ответственности
- ✅ Слабую связанность компонентов
