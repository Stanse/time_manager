# Примеры расширения функционала

Этот файл содержит практические примеры добавления новых функций в приложение.

## Пример 1: Добавление категорий для задач

### Шаг 1: Расширить модель Task

```javascript
// src/models/Task.js
export class Task {
  constructor({ id, name, totalTime = 0, startTime = null, category = 'work' }) {
    this.id = id;
    this.name = name;
    this.totalTime = totalTime;
    this.startTime = startTime;
    this.category = category; // ← Новое поле
  }

  static create(name, category = 'work') {
    return new Task({
      id: Date.now().toString(),
      name,
      totalTime: 0,
      startTime: null,
      category // ← Передаём категорию
    });
  }

  setCategory(category) {
    this.category = category;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      totalTime: this.totalTime,
      startTime: this.startTime,
      category: this.category // ← Добавить в сериализацию
    };
  }
}
```

### Шаг 2: Добавить методы в TaskService

```javascript
// src/services/TaskService.js
export class TaskService {
  // ... существующий код

  async createTaskWithCategory(name, category) {
    logger.log(`➕ Creating new task: "${name}" in category "${category}"`);
    const task = Task.create(name, category);
    this.taskList.addTask(task);
    await this.saveTasks();
    return task;
  }

  async updateTaskCategory(taskId, category) {
    logger.log(`🏷 Updating task category ${taskId}: "${category}"`);
    const task = this.taskList.getTask(taskId);
    if (task) {
      task.setCategory(category);
      this.taskList.emit('taskUpdated', { task });
      await this.saveTasks();
      return true;
    }
    return false;
  }

  getTasksByCategory(category) {
    return this.taskList.getAllTasks().filter(task => task.category === category);
  }
}
```

### Шаг 3: Обновить View

```javascript
// src/views/TaskListView.js
export class TaskListView extends BaseView {
  renderTask(task, isActive) {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-item ${isActive ? 'active' : ''}`;
    taskDiv.dataset.taskId = task.id;

    const categoryColors = {
      work: '#4CAF50',
      personal: '#2196F3',
      hobby: '#FF9800'
    };

    const categoryBadge = `
      <span class="category-badge" style="background: ${categoryColors[task.category] || '#999'}">
        ${task.category}
      </span>
    `;

    taskDiv.innerHTML = `
      <div class="task-info" data-action="edit">
        <div class="task-name">
          ${this.escapeHtml(task.name)}
          ${categoryBadge}
        </div>
        <div class="task-time" data-time-display="${task.id}">
          ${TimeFormatter.format(task.getCurrentTime())}
        </div>
      </div>
      <div class="task-controls">
        <button class="${buttonClass}" data-action="toggle" title="${buttonText}">
          ${buttonText}
        </button>
        <button class="btn-control btn-delete" data-action="delete" title="Delete">
          🗑️
        </button>
      </div>
    `;

    this.element.appendChild(taskDiv);
  }
}
```

### Шаг 4: Добавить CSS

```css
/* src/styles/tasks.css */
.category-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  margin-left: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

### Шаг 5: Обновить Controller для выбора категории

```javascript
// src/controllers/AppController.js
export class AppController {
  handleNewTask() {
    logger.log('➕ New task');
    // Показываем модальное окно с выбором категории
    this.showCategoryModal();
  }

  showCategoryModal() {
    // Можно создать новый CategoryModalView или расширить существующий
    const category = prompt('Enter category (work/personal/hobby):', 'work');
    if (category) {
      this.modalView.openCreate();
      this.selectedCategory = category;
    }
  }

  async handleModalSubmit() {
    const value = this.modalView.getValue();

    if (!value) {
      alert('Please enter a task name');
      return;
    }

    const mode = this.modalView.getMode();

    if (mode === 'edit') {
      const taskId = this.modalView.getEditingTaskId();
      await this.taskService.updateTask(taskId, value);
    } else {
      // Используем категорию
      await this.taskService.createTaskWithCategory(
        value,
        this.selectedCategory || 'work'
      );
    }

    this.modalView.close();
    this.selectedCategory = null;
  }
}
```

## Пример 2: Добавление экспорта данных в CSV

### Создать утилиту для экспорта

```javascript
// src/utils/CsvExporter.js
export class CsvExporter {
  static exportTasks(tasks) {
    // Заголовок CSV
    let csv = 'Name,Category,Total Time (seconds),Total Time (formatted)\n';

    // Добавить задачи
    tasks.forEach(task => {
      const formattedTime = TimeFormatter.format(task.totalTime);
      csv += `"${task.name}","${task.category}",${task.totalTime},"${formattedTime}"\n`;
    });

    return csv;
  }

  static downloadCsv(csv, filename = 'tasks.csv') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static exportAndDownload(tasks) {
    const csv = this.exportTasks(tasks);
    this.downloadCsv(csv, `tasks-${Date.now()}.csv`);
  }
}
```

### Добавить кнопку экспорта в UI

```html
<!-- index.html -->
<div class="header">
  <div class="logo">
    SIMP<span class="logo-dot"></span>E
  </div>
  <div class="header-actions">
    <button class="export-btn" id="exportBtn">📊 Export</button>
    <div class="total-time">TODAY <span id="totalTime">0h 0m 0s</span></div>
  </div>
</div>
```

### Добавить обработчик в Controller

```javascript
// src/controllers/AppController.js
import { CsvExporter } from '../utils/CsvExporter.js';

export class AppController {
  setupEventListeners() {
    // ... существующие обработчики

    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.handleExport());
    }
  }

  handleExport() {
    logger.log('📊 Exporting tasks...');
    const tasks = this.taskList.getAllTasks();

    if (tasks.length === 0) {
      alert('No tasks to export');
      return;
    }

    CsvExporter.exportAndDownload(tasks);
    logger.log(`✓ Exported ${tasks.length} tasks`);
  }
}
```

## Пример 3: Добавление статистики

### Создать модель статистики

```javascript
// src/models/Statistics.js
export class Statistics {
  constructor(tasks) {
    this.tasks = tasks;
  }

  getTotalTime() {
    return this.tasks.reduce((sum, task) => sum + task.totalTime, 0);
  }

  getTaskCount() {
    return this.tasks.length;
  }

  getMostProductiveTask() {
    if (this.tasks.length === 0) return null;
    return this.tasks.reduce((max, task) =>
      task.totalTime > max.totalTime ? task : max
    );
  }

  getAverageTaskTime() {
    if (this.tasks.length === 0) return 0;
    return Math.floor(this.getTotalTime() / this.tasks.length);
  }

  getTasksByCategory() {
    const byCategory = {};
    this.tasks.forEach(task => {
      if (!byCategory[task.category]) {
        byCategory[task.category] = {
          count: 0,
          totalTime: 0,
          tasks: []
        };
      }
      byCategory[task.category].count++;
      byCategory[task.category].totalTime += task.totalTime;
      byCategory[task.category].tasks.push(task);
    });
    return byCategory;
  }

  getProductivityScore() {
    // Простой скоринг: количество задач * среднее время
    const count = this.getTaskCount();
    const avgTime = this.getAverageTaskTime();
    return Math.floor((count * avgTime) / 3600); // В часах
  }
}
```

### Создать View для статистики

```javascript
// src/views/StatisticsView.js
import { BaseView } from './BaseView.js';
import { TimeFormatter } from '../utils/TimeFormatter.js';
import { Statistics } from '../models/Statistics.js';

export class StatisticsView extends BaseView {
  render(tasks) {
    const stats = new Statistics(tasks);

    const html = `
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-label">Total Tasks</div>
          <div class="stat-value">${stats.getTaskCount()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Time</div>
          <div class="stat-value">${TimeFormatter.format(stats.getTotalTime())}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Average Time</div>
          <div class="stat-value">${TimeFormatter.format(stats.getAverageTaskTime())}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Productivity Score</div>
          <div class="stat-value">${stats.getProductivityScore()}h</div>
        </div>
      </div>
    `;

    this.setContent(html);
  }
}
```

### Добавить стили

```css
/* src/styles/statistics.css */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin: 20px 0;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #999;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #4CAF50;
  font-family: 'Courier New', monospace;
}
```

## Пример 4: Добавление уведомлений

### Создать сервис уведомлений

```javascript
// src/services/NotificationService.js
import { logger } from '../utils/Logger.js';

export class NotificationService {
  static instance = null;

  constructor() {
    if (NotificationService.instance) {
      return NotificationService.instance;
    }

    this.permission = 'default';
    this.checkPermission();

    NotificationService.instance = this;
  }

  static getInstance() {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
      logger.log('Notification permission:', this.permission);
    }
  }

  async requestPermission() {
    if ('Notification' in window && this.permission === 'default') {
      this.permission = await Notification.requestPermission();
      logger.log('Notification permission updated:', this.permission);
    }
    return this.permission === 'granted';
  }

  notify(title, options = {}) {
    if (this.permission !== 'granted') {
      logger.warn('Notifications not permitted');
      return;
    }

    const notification = new Notification(title, {
      icon: '/icon.png',
      badge: '/badge.png',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }

  notifyTaskCompleted(taskName, totalTime) {
    this.notify('Task Completed!', {
      body: `"${taskName}" - Total time: ${totalTime}`,
      tag: 'task-completed'
    });
  }

  notifyLongRunningTask(taskName, duration) {
    this.notify('Long Running Task', {
      body: `"${taskName}" has been running for ${duration}`,
      tag: 'long-running'
    });
  }
}

export const notificationService = NotificationService.getInstance();
```

### Интегрировать с TaskService

```javascript
// src/services/TaskService.js
import { notificationService } from './NotificationService.js';

export class TaskService {
  async stopTask(taskId) {
    logger.log(`⏸ Stopping task: ${taskId}`);
    const task = this.taskList.getTask(taskId);

    if (task) {
      const elapsed = task.stop();

      // Отправить уведомление при остановке
      notificationService.notifyTaskCompleted(
        task.name,
        TimeFormatter.format(task.totalTime)
      );
    }

    // ... остальной код
  }
}
```

## Заключение

Эти примеры показывают, как легко расширять функционал благодаря модульной архитектуре:

1. **Добавление новых свойств**: Обновить модели и их сериализацию
2. **Новая логика**: Создать новые методы в Services
3. **UI изменения**: Обновить Views и добавить CSS
4. **Координация**: Добавить обработчики в Controller

Архитектура позволяет добавлять функционал без изменения существующего кода!
