import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { BirthdayStorage } from '../services/storage';
import { log } from '@botman/logger';

declare module 'fastify' {
  interface FastifyInstance {
    storage: BirthdayStorage;
  }
}

/**
 * This plugin initializes the birthday storage service
 */
export default fp(async function (fastify: FastifyInstance) {
  const storage = new BirthdayStorage();
  await storage.initialize();

  fastify.decorate('storage', storage);

  const birthdayCount = (await storage.getAll()).length;
  log.info('💾 Birthday storage initialized');
  log.info(`👥 Tracking ${birthdayCount} ${birthdayCount === 1 ? 'person' : 'people'} for birthday reminders`);
});
