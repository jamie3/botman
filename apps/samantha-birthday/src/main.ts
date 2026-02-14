// Only load dotenv in development (not in Docker where env vars are injected)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

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

// Add listen hook to run startup tasks after server is fully initialized and listening
server.addHook('onListen', async function () {
  // Check for upcoming birthdays on startup
  const upcomingBirthdays: Array<{ name: string; nickname?: string; date: string; daysUntil: number }> = [];
  try {
    const birthdays = await this.storage.getAll();
    const checker = new BirthdayChecker();
    await checker.checkBirthdays(birthdays, 14);

    // Collect upcoming birthdays for startup notification
    const { parseISO, format, differenceInDays, setYear, isBefore, addYears, startOfDay } = await import('date-fns');
    const today = startOfDay(new Date());

    for (const birthday of birthdays) {
      const birthDate = parseISO(birthday.date_of_birth);
      let thisYearBirthday = setYear(birthDate, today.getFullYear());

      if (isBefore(thisYearBirthday, today)) {
        thisYearBirthday = addYears(thisYearBirthday, 1);
      }

      const daysUntil = differenceInDays(thisYearBirthday, today);

      if (daysUntil >= 0 && daysUntil <= 14) {
        upcomingBirthdays.push({
          name: birthday.name,
          nickname: birthday.nickname,
          date: format(thisYearBirthday, 'MMM do'),
          daysUntil
        });
      }
    }

    // Sort by days until birthday
    upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);
  } catch (error) {
    log.error('❌ Failed to check birthdays', error);
  }

  // Initialize Telegram notifier and send startup notification with upcoming birthdays
  const telegram = new TelegramNotifier();
  if (telegram.isEnabled()) {
    try {
      await telegram.sendStartupNotification(upcomingBirthdays);
    } catch (error) {
      log.error('❌ Failed to send startup notification', error);
    }
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
