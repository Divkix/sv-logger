import type { Log } from './db/schema';

export type LogListener = (log: Log) => void;

/**
 * In-memory event bus for log streaming.
 * Project-scoped: each project has its own set of listeners.
 * Used to broadcast new logs to connected SSE clients.
 */
class LogEventBus {
  private listeners: Map<string, Set<LogListener>> = new Map();

  /**
   * Subscribe to log events for a specific project.
   * @param projectId - The project to subscribe to
   * @param listener - Callback function to receive logs
   * @returns Unsubscribe function
   */
  onLog(projectId: string, listener: LogListener): () => void {
    let projectListeners = this.listeners.get(projectId);
    if (!projectListeners) {
      projectListeners = new Set();
      this.listeners.set(projectId, projectListeners);
    }
    projectListeners.add(listener);

    return () => {
      const projectListeners = this.listeners.get(projectId);
      if (projectListeners) {
        projectListeners.delete(listener);
        if (projectListeners.size === 0) {
          this.listeners.delete(projectId);
        }
      }
    };
  }

  /**
   * Emit a log event to all listeners subscribed to its project.
   * @param log - The log entry to emit
   */
  emitLog(log: Log): void {
    const projectListeners = this.listeners.get(log.projectId);
    if (projectListeners) {
      for (const listener of projectListeners) {
        listener(log);
      }
    }
  }

  /**
   * Get the number of listeners for a specific project.
   * @param projectId - The project to check
   * @returns Number of active listeners
   */
  getListenerCount(projectId: string): number {
    return this.listeners.get(projectId)?.size ?? 0;
  }

  /**
   * Clear all listeners from all projects.
   * Primarily used for testing.
   */
  clear(): void {
    this.listeners.clear();
  }
}

// Singleton instance for the application
export const logEventBus = new LogEventBus();
