# @botman/logger

A Winston-based logging library for the Botman monorepo with colorized console output.

## Features

- **Colorized Console Output** - Easy-to-read colored logs in the console
- **Timestamp Support** - All logs include timestamps
- **Multiple Log Levels** - error, warn, info, http, debug
- **Stack Traces** - Automatic stack trace inclusion for errors
- **Configurable** - Set log level via environment variable

## Installation

This library is already included in the monorepo. Import it in your application:

```typescript
import { logger, log } from '@botman/logger';
```

## Usage

### Basic Logging

```typescript
import { log } from '@botman/logger';

log.info('Application started');
log.warn('This is a warning');
log.error('An error occurred');
log.debug('Debug information');
log.http('HTTP request received');
```

### Using the Logger Instance

```typescript
import { logger } from '@botman/logger';

logger.info('Using the logger instance');
logger.error('Error with metadata', { userId: 123, action: 'login' });
```

### Error Logging with Stack Traces

```typescript
import { log } from '@botman/logger';

try {
  // Some code that might throw
  throw new Error('Something went wrong');
} catch (error) {
  log.error('Operation failed', error);
}
```

## Log Levels

The following log levels are available (in order of priority):

1. **error** - Error messages (red)
2. **warn** - Warning messages (yellow)
3. **info** - Informational messages (green)
4. **http** - HTTP request logs (cyan)
5. **debug** - Debug messages (blue)

## Configuration

Set the log level using the `LOG_LEVEL` environment variable:

```bash
# Show all logs including debug
LOG_LEVEL=debug npm start

# Show only warnings and errors
LOG_LEVEL=warn npm start

# Default level is 'info'
npm start
```

## Output Format

Logs are formatted as:

```
YYYY-MM-DD HH:mm:ss [LEVEL]: message
```

Example output:
```
2024-02-14 15:30:45 [info]: Application started
2024-02-14 15:30:46 [warn]: Low disk space
2024-02-14 15:30:47 [error]: Database connection failed
```

## Color Scheme

- **Error** - Red
- **Warn** - Yellow
- **Info** - Green
- **HTTP** - Cyan
- **Debug** - Blue

## Examples

### Application Startup

```typescript
import { log } from '@botman/logger';

log.info('Starting Samantha Birthday Service');
log.info('Loading birthday database...');
log.info('Server listening on port 3000');
```

### HTTP Request Logging

```typescript
import { log } from '@botman/logger';

app.use((req, res, next) => {
  log.http(`${req.method} ${req.url}`);
  next();
});
```

### Error Handling

```typescript
import { log } from '@botman/logger';

async function fetchBirthdays() {
  try {
    const birthdays = await storage.getAll();
    log.info(`Loaded ${birthdays.length} birthdays`);
    return birthdays;
  } catch (error) {
    log.error('Failed to load birthdays', error);
    throw error;
  }
}
```

### Debugging

```typescript
import { log } from '@botman/logger';

function processBirthday(birthday) {
  log.debug('Processing birthday', { id: birthday.id, name: birthday.name });
  // processing logic
  log.debug('Birthday processed successfully');
}
```

## Integration with Fastify

```typescript
import Fastify from 'fastify';
import { logger } from '@botman/logger';

const server = Fastify({
  logger: false, // Disable Fastify's built-in logger
});

// Use Winston logger instead
server.addHook('onRequest', (request, reply, done) => {
  logger.http(`${request.method} ${request.url}`);
  done();
});

server.addHook('onResponse', (request, reply, done) => {
  logger.http(`${request.method} ${request.url} - ${reply.statusCode}`);
  done();
});
```

## Best Practices

1. **Use appropriate log levels**
   - `error` - For errors that need attention
   - `warn` - For potential issues
   - `info` - For important events (startup, shutdown, major operations)
   - `http` - For HTTP requests/responses
   - `debug` - For detailed debugging information

2. **Include context**
   ```typescript
   log.info('User logged in', { userId: 123, email: 'user@example.com' });
   ```

3. **Log errors with stack traces**
   ```typescript
   try {
     // operation
   } catch (error) {
     log.error('Operation failed', error);
   }
   ```

4. **Avoid logging sensitive information**
   - Don't log passwords, tokens, or API keys
   - Be careful with PII (personally identifiable information)

## Development

### Building

```bash
npx nx build logger
```

### Linting

```bash
npx nx lint logger
```

## License

MIT
