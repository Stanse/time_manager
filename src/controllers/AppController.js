import { taskService } from '../services/TaskService.js';
import { logger } from '../utils/Logger.js';
import { TaskListView } from '../views/TaskListView.js';
import { ModalView } from '../views/ModalView.js';
import { HeaderView } from '../views/HeaderView.js';
import { DebugView } from '../views/DebugView.js';

/**
 * AppController - Main application controller
 * Coordinates between views and services
 */
export class AppController {
  constructor() {
    this.taskService = taskService;
    this.taskList = this.taskService.getTaskList();

    // Initialize views
    this.taskListView = new TaskListView(document.getElementById('taskList'));
    this.modalView = new ModalView(document.getElementById('modal'));
    this.headerView = new HeaderView(document.querySelector('.header'));
    this.debugView = new DebugView(
      document.getElementById('debugPanel'),
      document.getElementById('debugToggle')
    );

    this.setupEventListeners();
    this.subscribeToModelEvents();
  }

  /**
   * Initialize application
   */
  async initialize() {
    logger.log('🚀 Initializing Application...');

    // Initialize task service
    await this.taskService.initialize();

    // Initial render
    this.render();

    // Start header interval
    this.headerView.startInterval(() => this.taskList.getTotalTime());

    // Setup debug logger
    logger.onLog((log) => {
      if (this.debugView.isEnabled()) {
        this.debugView.addLog(log);
      }
    });

    logger.log('✓ Application ready!');
  }

  /**
   * Setup event listeners for UI interactions
   */
  setupEventListeners() {
    // Task list interactions
    this.taskListView.on('click', '[data-action="toggle"]', (e) => {
      e.stopPropagation();
      const taskId = e.target.closest('[data-task-id]').dataset.taskId;
      this.handleToggleTask(taskId, e);
    });

    this.taskListView.on('click', '[data-action="delete"]', (e) => {
      e.stopPropagation();
      const taskId = e.target.closest('[data-task-id]').dataset.taskId;
      this.handleDeleteTask(taskId, e);
    });

    this.taskListView.on('click', '[data-action="edit"]', (e) => {
      const taskId = e.target.closest('[data-task-id]').dataset.taskId;
      this.handleEditTask(taskId);
    });

    // New task button
    const newTaskBtn = document.querySelector('.new-task-btn');
    if (newTaskBtn) {
      newTaskBtn.addEventListener('click', () => this.handleNewTask());
    }

    // Modal interactions
    const modalCancelBtn = document.querySelector('.modal-btn-secondary');
    if (modalCancelBtn) {
      modalCancelBtn.addEventListener('click', () => this.modalView.close());
    }

    const modalSubmitBtn = document.querySelector('.modal-btn-primary');
    if (modalSubmitBtn) {
      modalSubmitBtn.addEventListener('click', () => this.handleModalSubmit());
    }

    const modalInput = document.querySelector('#taskInput');
    if (modalInput) {
      modalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleModalSubmit();
        }
      });
    }

    // Debug toggle
    const debugToggle = document.getElementById('debugToggle');
    if (debugToggle) {
      debugToggle.addEventListener('click', () => this.handleDebugToggle());
    }

    const debugClear = document.querySelector('.debug-clear');
    if (debugClear) {
      debugClear.addEventListener('click', () => logger.clear());
    }

    // Close modal on background click
    const modal = document.getElementById('modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.modalView.close();
        }
      });
    }
  }

  /**
   * Subscribe to model events
   */
  subscribeToModelEvents() {
    this.taskList.on('taskAdded', () => this.render());
    this.taskList.on('taskRemoved', () => this.render());
    this.taskList.on('taskUpdated', () => this.render());
    this.taskList.on('taskStarted', ({ task }) => {
      this.render();
      this.taskListView.animateTask(task.id, 'starting');
      this.vibrate(50);
    });
    this.taskList.on('taskStopped', ({ task }) => {
      this.render();
      this.taskListView.animateTask(task.id, 'stopping');
      this.vibrate(50);
    });
    this.taskList.on('changed', () => {
      this.headerView.updateTotalTime(this.taskList.getTotalTime());
    });
  }

  /**
   * Render the application
   */
  render() {
    const tasks = this.taskList.getAllTasks();
    const activeTaskId = this.taskList.activeTaskId;

    this.taskListView.render(tasks, activeTaskId);
    this.headerView.updateTotalTime(this.taskList.getTotalTime());
  }

  /**
   * Handle toggle task
   */
  handleToggleTask(taskId, event) {
    logger.log(`🔄 Toggle task: ${taskId}`);

    // Add visual feedback
    const button = event.target.closest('.btn-control');
    if (button) {
      button.classList.add('clicking');
      setTimeout(() => button.classList.remove('clicking'), 300);
    }

    this.taskService.toggleTask(taskId);
  }

  /**
   * Handle delete task
   */
  async handleDeleteTask(taskId, event) {
    logger.log(`🗑 Delete task: ${taskId}`);

    // Add visual feedback
    const button = event.target.closest('.btn-control');
    if (button) {
      button.classList.add('clicking');
      setTimeout(() => button.classList.remove('clicking'), 300);
    }

    const task = this.taskList.getTask(taskId);
    if (!task) return;

    if (confirm(`Delete task "${task.name}"?`)) {
      this.vibrate([50, 50, 50]);
      await this.taskService.deleteTask(taskId);
    }
  }

  /**
   * Handle edit task
   */
  handleEditTask(taskId) {
    logger.log(`✏ Edit task: ${taskId}`);
    const task = this.taskList.getTask(taskId);
    if (task) {
      this.modalView.openEdit(taskId, task.name);
    }
  }

  /**
   * Handle new task
   */
  handleNewTask() {
    logger.log('➕ New task');
    this.modalView.openCreate();
  }

  /**
   * Handle modal submit
   */
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
      await this.taskService.createTask(value);
    }

    this.modalView.close();
  }

  /**
   * Handle debug toggle
   */
  handleDebugToggle() {
    const enabled = this.debugView.toggle();
    if (enabled) {
      logger.enable();
      logger.log('🐛 Debug mode enabled');
    } else {
      logger.disable();
    }
  }

  /**
   * Trigger vibration if supported
   * @param {number|Array} pattern - Vibration pattern
   */
  vibrate(pattern) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }
}
