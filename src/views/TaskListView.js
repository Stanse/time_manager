import { BaseView } from './BaseView.js';
import { TimeFormatter } from '../utils/TimeFormatter.js';

/**
 * TaskListView - Renders task list
 */
export class TaskListView extends BaseView {
  constructor(element) {
    super(element);
    this.intervals = new Map();
  }

  /**
   * Render task list
   * @param {Array} tasks - Array of tasks
   * @param {string|null} activeTaskId - Active task ID
   */
  render(tasks, activeTaskId) {
    // Clear existing intervals
    this.clearIntervals();

    // Render tasks
    this.clear();
    tasks.forEach(task => {
      this.renderTask(task, task.id === activeTaskId);
    });

    // Start intervals for active task
    if (activeTaskId) {
      this.startTaskInterval(activeTaskId);
    }
  }

  /**
   * Render a single task
   * @param {Task} task - Task to render
   * @param {boolean} isActive - Is task active
   */
  renderTask(task, isActive) {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-item ${isActive ? 'active' : ''}`;
    taskDiv.dataset.taskId = task.id;

    const buttonClass = isActive ? 'btn-control btn-stop' : 'btn-control btn-start';
    const buttonText = isActive ? 'STOP' : 'START';

    taskDiv.innerHTML = `
      <div class="task-info" data-action="edit">
        <div class="task-name">${this.escapeHtml(task.name)}</div>
        <div class="task-time" data-time-display="${task.id}">${TimeFormatter.format(task.getCurrentTime())}</div>
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

  /**
   * Start interval for updating task time
   * @param {string} taskId - Task ID
   */
  startTaskInterval(taskId) {
    const interval = setInterval(() => {
      const timeDisplay = document.querySelector(`[data-time-display="${taskId}"]`);
      if (timeDisplay) {
        const taskElement = timeDisplay.closest('[data-task-id]');
        if (taskElement) {
          // This will be updated by controller
          this.emit('updateTime', { taskId });
        }
      } else {
        this.clearInterval(taskId);
      }
    }, 1000);

    this.intervals.set(taskId, interval);
  }

  /**
   * Clear interval for task
   * @param {string} taskId - Task ID
   */
  clearInterval(taskId) {
    const interval = this.intervals.get(taskId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(taskId);
    }
  }

  /**
   * Clear all intervals
   */
  clearIntervals() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
  }

  /**
   * Update task time display
   * @param {string} taskId - Task ID
   * @param {number} time - Time in seconds
   */
  updateTaskTime(taskId, time) {
    const timeDisplay = document.querySelector(`[data-time-display="${taskId}"]`);
    if (timeDisplay) {
      timeDisplay.textContent = TimeFormatter.format(time);
    }
  }

  /**
   * Add animation to task element
   * @param {string} taskId - Task ID
   * @param {string} animation - Animation class name
   */
  animateTask(taskId, animation) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      taskElement.classList.add(animation);
      setTimeout(() => {
        taskElement.classList.remove(animation);
      }, 300);
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Emit custom event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    this.element.dispatchEvent(new CustomEvent(event, { detail: data, bubbles: true }));
  }
}
