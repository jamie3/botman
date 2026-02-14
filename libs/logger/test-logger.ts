import { log } from './src/index';

console.log('Testing @botman/logger with colorized console output:\n');

log.error('This is an error message');
log.warn('This is a warning message');
log.info('This is an info message');
log.http('This is an HTTP log message');
log.debug('This is a debug message (set LOG_LEVEL=debug to see this)');

console.log('\nTesting error with stack trace:');
try {
  throw new Error('Test error with stack trace');
} catch (error) {
  log.error('Caught an error', error);
}

console.log('\nLogger test complete!');
