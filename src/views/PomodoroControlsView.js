import { BaseView } from './BaseView.js';

/**
 * PomodoroControlsView - Renders control buttons
 */
export class PomodoroControlsView extends BaseView {
  /**
   * Render controls
   * @param {string} state - Timer state (idle, running, paused)
   */
  render(state) {
    let buttons = '';

    if (state === 'idle' || state === 'paused') {
      buttons = `
        <button class="btn-control" data-action="start">
          ${state === 'paused' ? 'Resume' : 'Start'}
        </button>
      `;
    } else if (state === 'running') {
      buttons = `
        <button class="btn-control" data-action="pause">Pause</button>
      `;
    }

    // Always show reset button if not idle
    if (state !== 'idle') {
      buttons += `
        <button class="btn-control secondary" data-action="reset">Reset</button>
      `;
    }

    this.setContent(buttons);
  }
}
