import { EventEmitter } from '../utils/EventEmitter.js';
import { Task } from './Task.js';

/**
 * TaskList Model - Manages collection of tasks
 * Implements Observer pattern via EventEmitter
 */
export class TaskList extends EventEmitter {
  constructor() {
    super();
    this.tasks = [];
    this.activeTaskId = null;
  }

  /**
   * Add a new task
   * @param {Task} task - Task to add
   */
  addTask(task) {
    this.tasks.push(task);
    this.emit('taskAdded', { task });
    this.emit('changed');
  }

  /**
   * Remove a task by ID
   * @param {string} taskId - Task ID to remove
   * @returns {boolean} True if task was removed
   */
  removeTask(taskId) {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      const task = this.tasks[index];

      // Stop task if it's active
      if (this.activeTaskId === taskId) {
        this.stopTask(taskId);
      }

      this.tasks.splice(index, 1);
      this.emit('taskRemoved', { task });
      this.emit('changed');
      return true;
    }
    return false;
  }

  /**
   * Get task by ID
   * @param {string} taskId - Task ID
   * @returns {Task|null} Task or null if not found
   */
  getTask(taskId) {
    return this.tasks.find(t => t.id === taskId) || null;
  }

  /**
   * Get all tasks
   * @returns {Array<Task>} Array of tasks
   */
  getAllTasks() {
    return [...this.tasks];
  }

  /**
   * Get active task
   * @returns {Task|null} Active task or null
   */
  getActiveTask() {
    if (this.activeTaskId) {
      return this.getTask(this.activeTaskId);
    }
    return null;
  }

  /**
   * Start a task
   * @param {string} taskId - Task ID to start
   * @returns {boolean} True if task was started
   */
  startTask(taskId) {
    const task = this.getTask(taskId);
    if (!task) return false;

    // Stop current active task if any
    if (this.activeTaskId && this.activeTaskId !== taskId) {
      this.stopTask(this.activeTaskId);
    }

    task.start();
    this.activeTaskId = taskId;
    this.emit('taskStarted', { task });
    this.emit('changed');
    return true;
  }

  /**
   * Stop a task
   * @param {string} taskId - Task ID to stop
   * @returns {boolean} True if task was stopped
   */
  stopTask(taskId) {
    const task = this.getTask(taskId);
    if (!task) return false;

    const elapsed = task.stop();
    if (this.activeTaskId === taskId) {
      this.activeTaskId = null;
    }

    this.emit('taskStopped', { task, elapsed });
    this.emit('changed');
    return true;
  }

  /**
   * Toggle task (start if stopped, stop if started)
   * @param {string} taskId - Task ID to toggle
   * @returns {boolean} True if task was toggled
   */
  toggleTask(taskId) {
    const task = this.getTask(taskId);
    if (!task) return false;

    if (this.activeTaskId === taskId) {
      return this.stopTask(taskId);
    } else {
      return this.startTask(taskId);
    }
  }

  /**
   * Update task name
   * @param {string} taskId - Task ID
   * @param {string} newName - New name
   * @returns {boolean} True if task was updated
   */
  updateTaskName(taskId, newName) {
    const task = this.getTask(taskId);
    if (!task) return false;

    task.rename(newName);
    this.emit('taskUpdated', { task });
    this.emit('changed');
    return true;
  }

  /**
   * Get total time across all tasks
   * @returns {number} Total time in seconds
   */
  getTotalTime() {
    return this.tasks.reduce((total, task) => {
      return total + task.getCurrentTime();
    }, 0);
  }

  /**
   * Convert to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      tasks: this.tasks.map(task => task.toJSON()),
      activeTaskId: this.activeTaskId
    };
  }

  /**
   * Load from JSON
   * @param {Object} data - JSON data
   */
  fromJSON(data) {
    this.tasks = data.tasks.map(taskData => Task.fromJSON(taskData));
    this.activeTaskId = data.activeTaskId;
    this.emit('changed');
  }

  /**
   * Clear all tasks
   */
  clear() {
    this.tasks = [];
    this.activeTaskId = null;
    this.emit('cleared');
    this.emit('changed');
  }
}
