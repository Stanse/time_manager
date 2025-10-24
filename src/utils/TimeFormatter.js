/**
 * TimeFormatter - Utility class for time formatting
 */
export class TimeFormatter {
  /**
   * Format seconds to human-readable time string
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string (e.g., "2h 30m 45s")
   */
  static format(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  }

  /**
   * Parse time string to seconds
   * @param {string} timeString - Time string (e.g., "2h 30m 45s")
   * @returns {number} Time in seconds
   */
  static parse(timeString) {
    const hoursMatch = timeString.match(/(\d+)h/);
    const minutesMatch = timeString.match(/(\d+)m/);
    const secondsMatch = timeString.match(/(\d+)s/);

    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 0;

    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Get current timestamp in milliseconds
   * @returns {number} Current timestamp
   */
  static now() {
    return Date.now();
  }

  /**
   * Calculate elapsed seconds from timestamp
   * @param {number} startTime - Start timestamp in milliseconds
   * @returns {number} Elapsed seconds
   */
  static elapsed(startTime) {
    return Math.floor((Date.now() - startTime) / 1000);
  }
}
