import Fastify from 'fastify';
import { app } from './app/app';
import { log } from '@botman/logger';

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 8080;

// Instantiate Fastify without built-in logger
const server = Fastify({
  logger: false,
});

// Register your application as a normal plugin.
server.register(app);

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    log.error('❌ Failed to start server', err);
    process.exit(1);
  } else {
    log.info(`🎂 Samantha Birthday Assistant started`);
    log.info(`🚀 Server listening at http://${host}:${port}`);
  }
});
