import 'dotenv/config';
import Fastify from 'fastify';
import { app } from './app/app';
import { log } from '@botman/logger';
import { BirthdayChecker } from './app/services/birthday-checker';
import { TelegramNotifier } from './app/services/telegram-notifier';

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 8080;

// Instantiate Fastify without built-in logger
const server = Fastify({
  logger: false,
});

// Register your application as a normal plugin.
server.register(app);

// Start listening.
server.listen({ port, host }, async (err) => {
  if (err) {
    log.error('❌ Failed to start server', err);
    process.exit(1);
  } else {
    log.info(`🎂 Samantha Birthday Assistant started`);
     log.info(`🚀 Server listening at http://${host}:${port}`);

    // Initialize Telegram notifier and send startup notification
    const telegram = new TelegramNotifier();
    if (telegram.isEnabled()) {
      try {
        await telegram.sendStartupNotification();
      } catch (error) {
        log.error('❌ Failed to send startup notification', error);
      }
    }

    // Check for upcoming birthdays on startup
    try {
      const birthdays = await server.storage.getAll();
      const checker = new BirthdayChecker();
      await checker.checkBirthdays(birthdays, 14);
    } catch (error) {
      log.error('❌ Failed to check birthdays', error);
    }
  }
});
