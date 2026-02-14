import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { log } from '@botman/logger';

/**
 * This plugin adds HTTP request/response logging
 */
export default fp(async function (fastify: FastifyInstance) {
  // Log incoming requests
  fastify.addHook('onRequest', async (request) => {
    log.http(`${request.method} ${request.url}`);
  });

  // Log responses
  fastify.addHook('onResponse', async (request, reply) => {
    log.http(`${request.method} ${request.url} - ${reply.statusCode}`);
  });

  // Log errors
  fastify.addHook('onError', async (request, reply, error) => {
    log.error(`Error on ${request.method} ${request.url}`, error);
  });
});
