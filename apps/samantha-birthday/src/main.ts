// Only load dotenv in development (not in Docker where env vars are injected)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

import Fastify from 'fastify';
import { app } from './app/app';
import { log } from '@botman/logger';
import { BirthdayChecker } from './app/services/birthday-checker';
import { TelegramNotifier } from './app/services/telegram-notifier';
import { BirthdayStorage } from './app/services/storage';

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 8080;

// Instantiate Fastify without built-in logger
const server = Fastify({
  logger: false,
});

// Register your application as a normal plugin.
server.register(app);

// Initialize Telegram notifier at the app level (keep it alive)
const telegram = new TelegramNotifier();

// Add listen hook to send startup notification after server is listening
server.addHook('onListen', async function () {
  // Send startup notification if Telegram is enabled
  if (telegram.isEnabled()) {
    // Small delay to ensure storage is fully ready, then access via server instance
    setTimeout(async () => {
      try {
        // Get count of people being tracked by creating a new storage instance
        let birthdayCount = 0;
        try {
          const storage = new BirthdayStorage();
          await storage.initialize();
          const birthdays = await storage.getAll();
          birthdayCount = birthdays.length;
          log.info(`📊 Retrieved ${birthdayCount} birthdays for notification`);
        } catch (e) {
          log.warn('⚠️  Could not get birthday count for startup notification', e);
        }

        await telegram.sendStartupNotification(undefined, birthdayCount);
      } catch (error) {
        log.error('❌ Failed to send startup notification', error);
      }
    }, 1000); // Wait 1 second for storage to be fully ready
  }
});

// Start server after plugins are loaded
async function start() {
  try {
    // Wait for all plugins to be loaded
    await server.ready();

    // Start listening
    await server.listen({ port, host });

    log.info(`🎂 Samantha Birthday Assistant started`);
    log.info(`🚀 Server listening at http://${host}:${port}`);
  } catch (err) {
    log.error('❌ Failed to start server', err);
    process.exit(1);
  }
}

start();
