type LogLevel = 'info' | 'warn' | 'error';

const formatMessage = (level: LogLevel, message: string) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
};

export const logEvent = (level: LogLevel, message: string) => {
  const formatted = formatMessage(level, message);
  // Log without PII; caller must redact sensitive fields.
  if (level === 'error') {
    console.error(formatted);
  } else if (level === 'warn') {
    console.warn(formatted);
  } else {
    console.info(formatted);
  }
};
