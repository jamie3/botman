import * as winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format with colors
const customFormat = printf(({ level, message, timestamp, stack }: winston.Logform.TransformableInfo) => {
  if (stack) {
    return `${timestamp} [${level}]: ${message}\n${stack}`;
  }
  return `${timestamp} [${level}]: ${message}`;
});

// Create the logger instance
export const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  format: combine(
    errors({ stack: true }), // Include stack traces for errors
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }), // Colorize the entire output
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
      ),
    }),
  ],
});

// Export convenience methods
export const log = {
  error: (message: string, ...meta: any[]) => logger.error(message, ...meta),
  warn: (message: string, ...meta: any[]) => logger.warn(message, ...meta),
  info: (message: string, ...meta: any[]) => logger.info(message, ...meta),
  http: (message: string, ...meta: any[]) => logger.http(message, ...meta),
  debug: (message: string, ...meta: any[]) => logger.debug(message, ...meta),
};

export default logger;
