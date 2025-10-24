/**
 * Task Model - Represents a single task
 */
export class Task {
  /**
   * Create a new Task
   * @param {Object} data - Task data
   * @param {string} data.id - Task ID
   * @param {string} data.name - Task name
   * @param {number} data.totalTime - Total time in seconds
   * @param {number|null} data.startTime - Start timestamp or null
   */
  constructor({ id, name, totalTime = 0, startTime = null }) {
    this.id = id;
    this.name = name;
    this.totalTime = totalTime;
    this.startTime = startTime;
  }

  /**
   * Create a new task with generated ID
   * @param {string} name - Task name
   * @returns {Task} New task instance
   */
  static create(name) {
    return new Task({
      id: Date.now().toString(),
      name,
      totalTime: 0,
      startTime: null
    });
  }

  /**
   * Check if task is currently running
   * @returns {boolean} True if task is running
   */
  isRunning() {
    return this.startTime !== null;
  }

  /**
   * Start the task
   */
  start() {
    if (!this.isRunning()) {
      this.startTime = Date.now();
    }
  }

  /**
   * Stop the task and update total time
   * @returns {number} Elapsed time since start
   */
  stop() {
    if (this.isRunning()) {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.totalTime += elapsed;
      this.startTime = null;
      return elapsed;
    }
    return 0;
  }

  /**
   * Get current time including running time
   * @returns {number} Current total time in seconds
   */
  getCurrentTime() {
    if (this.isRunning()) {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      return this.totalTime + elapsed;
    }
    return this.totalTime;
  }

  /**
   * Update task name
   * @param {string} newName - New task name
   */
  rename(newName) {
    this.name = newName;
  }

  /**
   * Convert task to plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      totalTime: this.totalTime,
      startTime: this.startTime
    };
  }

  /**
   * Create task from plain object
   * @param {Object} data - Plain object data
   * @returns {Task} Task instance
   */
  static fromJSON(data) {
    return new Task(data);
  }
}
