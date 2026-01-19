type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  error?: Error;
}

interface ErrorServiceConfig {
  minLevel: LogLevel;
  maxLogHistory: number;
  onError?: (entry: LogEntry) => void;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class ErrorService {
  private config: ErrorServiceConfig;
  private logHistory: LogEntry[] = [];

  constructor(config: Partial<ErrorServiceConfig> = {}) {
    this.config = {
      minLevel: config.minLevel ?? 'info',
      maxLogHistory: config.maxLogHistory ?? 100,
      onError: config.onError,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    if (this.logHistory.length > this.config.maxLogHistory) {
      this.logHistory.shift();
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
    };

    this.addToHistory(entry);

    // Console output with styling
    const styles: Record<LogLevel, string> = {
      debug: 'color: gray',
      info: 'color: blue',
      warn: 'color: orange',
      error: 'color: red; font-weight: bold',
    };

    const prefix = `[${level.toUpperCase()}] [${entry.timestamp.toISOString()}]`;

    if (level === 'error') {
      console.error(`%c${prefix}`, styles[level], message, context, error);
      this.config.onError?.(entry);
    } else if (level === 'warn') {
      console.warn(`%c${prefix}`, styles[level], message, context);
    } else {
      console.log(`%c${prefix}`, styles[level], message, context);
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('error', message, context, error);
  }

  captureException(error: Error, context?: Record<string, unknown>): void {
    this.error(error.message, error, {
      ...context,
      stack: error.stack,
      name: error.name,
    });
  }

  getLogHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  clearHistory(): void {
    this.logHistory = [];
  }

  setConfig(config: Partial<ErrorServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Create singleton instance
export const errorService = new ErrorService({
  minLevel: import.meta.env.DEV ? 'debug' : 'warn',
});

// Helper functions for common error scenarios
export const logFileParseError = (fileName: string, error: Error): void => {
  errorService.error(`Failed to parse file: ${fileName}`, error, {
    fileName,
    type: 'file_parse_error',
  });
};

export const logApiError = (endpoint: string, error: Error, statusCode?: number): void => {
  errorService.error(`API error: ${endpoint}`, error, {
    endpoint,
    statusCode,
    type: 'api_error',
  });
};

export const logUserAction = (action: string, details?: Record<string, unknown>): void => {
  errorService.info(`User action: ${action}`, {
    action,
    ...details,
    type: 'user_action',
  });
};

export const logPerformance = (metric: string, value: number, unit: string = 'ms'): void => {
  errorService.debug(`Performance: ${metric}`, {
    metric,
    value,
    unit,
    type: 'performance',
  });
};
