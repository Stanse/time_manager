import { TaskList } from '../models/TaskList.js';
import { Task } from '../models/Task.js';
import { storage } from './StorageService.js';
import { logger } from '../utils/Logger.js';

/**
 * TaskService - Singleton pattern for task management
 * Handles business logic and persistence
 */
export class TaskService {
  static instance = null;
  static STORAGE_KEY = 'tasks';

  constructor() {
    if (TaskService.instance) {
      return TaskService.instance;
    }

    this.taskList = new TaskList();
    this.autoSaveInterval = null;

    TaskService.instance = this;
  }

  /**
   * Get singleton instance
   * @returns {TaskService} TaskService instance
   */
  static getInstance() {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  /**
   * Initialize service
   */
  async initialize() {
    logger.log('🚀 Initializing TaskService...');
    await this.loadTasks();
    this.startAutoSave();
    this.setupLifecycleHandlers();
    logger.log('✓ TaskService initialized');
  }

  /**
   * Get task list
   * @returns {TaskList} Task list instance
   */
  getTaskList() {
    return this.taskList;
  }

  /**
   * Create a new task
   * @param {string} name - Task name
   * @returns {Task} Created task
   */
  async createTask(name) {
    logger.log(`➕ Creating new task: "${name}"`);
    const task = Task.create(name);
    this.taskList.addTask(task);
    await this.saveTasks();
    return task;
  }

  /**
   * Delete a task
   * @param {string} taskId - Task ID
   * @returns {boolean} True if deleted
   */
  async deleteTask(taskId) {
    logger.log(`🗑 Deleting task: ${taskId}`);
    const result = this.taskList.removeTask(taskId);
    if (result) {
      await this.saveTasks();
    }
    return result;
  }

  /**
   * Update task name
   * @param {string} taskId - Task ID
   * @param {string} newName - New name
   * @returns {boolean} True if updated
   */
  async updateTask(taskId, newName) {
    logger.log(`✏ Updating task ${taskId}: "${newName}"`);
    const result = this.taskList.updateTaskName(taskId, newName);
    if (result) {
      await this.saveTasks();
    }
    return result;
  }

  /**
   * Start a task
   * @param {string} taskId - Task ID
   * @returns {boolean} True if started
   */
  startTask(taskId) {
    logger.log(`▶ Starting task: ${taskId}`);
    return this.taskList.startTask(taskId);
  }

  /**
   * Stop a task
   * @param {string} taskId - Task ID
   * @returns {boolean} True if stopped
   */
  async stopTask(taskId) {
    logger.log(`⏸ Stopping task: ${taskId}`);
    const result = this.taskList.stopTask(taskId);
    if (result) {
      await this.saveTasks();
    }
    return result;
  }

  /**
   * Toggle a task
   * @param {string} taskId - Task ID
   * @returns {boolean} True if toggled
   */
  toggleTask(taskId) {
    logger.log(`🔄 Toggling task: ${taskId}`);
    return this.taskList.toggleTask(taskId);
  }

  /**
   * Load tasks from storage
   */
  async loadTasks() {
    logger.log('📂 Loading tasks from storage...');
    try {
      const data = await storage.get(TaskService.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.taskList.fromJSON(parsed);
        logger.log(`✓ Loaded ${this.taskList.getAllTasks().length} tasks`);
      } else {
        logger.log('📝 No saved tasks found');
      }
    } catch (error) {
      logger.error('❌ Error loading tasks:', error);
    }
  }

  /**
   * Save tasks to storage
   */
  async saveTasks() {
    logger.log('💾 Saving tasks to storage...');
    try {
      const data = JSON.stringify(this.taskList.toJSON());
      await storage.set(TaskService.STORAGE_KEY, data);
      logger.log('✓ Tasks saved successfully');
    } catch (error) {
      logger.error('❌ Error saving tasks:', error);
    }
  }

  /**
   * Start auto-save interval
   */
  startAutoSave() {
    // Auto-save every 30 seconds when task is active
    this.autoSaveInterval = setInterval(async () => {
      const activeTask = this.taskList.getActiveTask();
      if (activeTask) {
        logger.log('💾 Periodic auto-save (task is running)...');

        // Save current state
        const elapsed = Math.floor((Date.now() - activeTask.startTime) / 1000);
        const tempTotalTime = activeTask.totalTime;
        activeTask.totalTime += elapsed;
        activeTask.startTime = Date.now(); // Reset start time

        try {
          await this.saveTasks();
          logger.log('✓ Periodic save completed');
        } catch (error) {
          // Restore on error
          activeTask.totalTime = tempTotalTime;
          logger.error('❌ Periodic save failed:', error);
        }
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop auto-save interval
   */
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Setup lifecycle handlers for app close/background
   */
  setupLifecycleHandlers() {
    // Save before page unload (ПОЛНОЕ ЗАКРЫТИЕ)
    window.addEventListener('beforeunload', () => {
      logger.log('💾 Auto-saving before app close...');
      const activeTask = this.taskList.getActiveTask();
      if (activeTask) {
        // Останавливаем задачу и очищаем startTime
        activeTask.stop();
        // Очищаем activeTaskId чтобы при следующем открытии задача не стартовала
        this.taskList.activeTaskId = null;
      }

      // Use synchronous localStorage as fallback
      try {
        const data = JSON.stringify(this.taskList.toJSON());
        localStorage.setItem(TaskService.STORAGE_KEY, data);
        logger.log('✓ Tasks saved to localStorage on close');
      } catch (error) {
        logger.error('❌ Error saving on close:', error);
      }
    });

    // Telegram WebApp viewport change (СВОРАЧИВАНИЕ - задача продолжает работать)
    if (window.Telegram?.WebApp) {
      logger.log('📱 Setting up Telegram lifecycle handlers...');
      window.Telegram.WebApp.onEvent('viewportChanged', async () => {
        logger.log('👁️ Viewport changed - auto-saving...');
        const activeTask = this.taskList.getActiveTask();
        if (activeTask && activeTask.startTime) {
          // Сохраняем прогресс, но НЕ останавливаем задачу
          const elapsed = Math.floor((Date.now() - activeTask.startTime) / 1000);
          activeTask.totalTime += elapsed;
          // Сбрасываем startTime на текущее время чтобы продолжить счет
          activeTask.startTime = Date.now();
          await this.saveTasks();
        }
      });
    }
  }
}

// Export singleton instance
export const taskService = TaskService.getInstance();
