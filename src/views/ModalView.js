import { BaseView } from './BaseView.js';

/**
 * ModalView - Manages modal dialog
 */
export class ModalView extends BaseView {
  constructor(element) {
    super(element);
    this.mode = 'create';
    this.editingTaskId = null;

    this.titleElement = this.element.querySelector('#modalTitle');
    this.inputElement = this.element.querySelector('#taskInput');
    this.submitButton = this.element.querySelector('#modalSubmitBtn');
  }

  /**
   * Open modal in create mode
   */
  openCreate() {
    this.mode = 'create';
    this.editingTaskId = null;

    this.titleElement.textContent = 'New Task';
    this.inputElement.value = '';
    this.submitButton.textContent = 'Create';

    this.show();
    this.inputElement.focus();
  }

  /**
   * Open modal in edit mode
   * @param {string} taskId - Task ID to edit
   * @param {string} taskName - Current task name
   */
  openEdit(taskId, taskName) {
    this.mode = 'edit';
    this.editingTaskId = taskId;

    this.titleElement.textContent = 'Edit Task';
    this.inputElement.value = taskName;
    this.submitButton.textContent = 'Save';

    this.show();
    this.inputElement.focus();
    this.inputElement.select();
  }

  /**
   * Close modal
   */
  close() {
    this.hide();
    this.inputElement.value = '';
    this.mode = 'create';
    this.editingTaskId = null;
  }

  /**
   * Show modal
   */
  show() {
    this.element.classList.add('show');
  }

  /**
   * Hide modal
   */
  hide() {
    this.element.classList.remove('show');
  }

  /**
   * Get input value
   * @returns {string} Input value
   */
  getValue() {
    return this.inputElement.value.trim();
  }

  /**
   * Get current mode
   * @returns {string} Mode ('create' or 'edit')
   */
  getMode() {
    return this.mode;
  }

  /**
   * Get editing task ID
   * @returns {string|null} Task ID or null
   */
  getEditingTaskId() {
    return this.editingTaskId;
  }
}
