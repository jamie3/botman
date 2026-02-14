import { FastifyInstance } from 'fastify';
import { CreateBirthdayInput, UpdateBirthdayInput } from '../types/birthday';

export default async function (fastify: FastifyInstance) {
  // Get all birthdays
  fastify.get('/birthdays', async function () {
    const birthdays = await this.storage.getAll();
    return { birthdays };
  });

  // Get a specific birthday by ID
  fastify.get<{ Params: { id: string } }>('/birthdays/:id', async function (request, reply) {
    const { id } = request.params;
    const birthday = await this.storage.getById(id);

    if (!birthday) {
      return reply.notFound(`Birthday with id ${id} not found`);
    }

    return birthday;
  });

  // Create a new birthday
  fastify.post<{ Body: CreateBirthdayInput }>('/birthdays', async function (request, reply) {
    const input = request.body;

    // Basic validation
    if (!input.name || !input.date_of_birth) {
      return reply.badRequest('Missing required fields: name, date_of_birth');
    }

    // Check if email already exists (only if email is provided)
    if (input.email) {
      const existing = await this.storage.findByEmail(input.email);
      if (existing) {
        return reply.conflict(`Birthday entry with email ${input.email} already exists`);
      }
    }

    const birthday = await this.storage.create(input);
    return reply.code(201).send(birthday);
  });

  // Update a birthday
  fastify.put<{ Params: { id: string }; Body: UpdateBirthdayInput }>('/birthdays/:id', async function (request, reply) {
    const { id } = request.params;
    const input = request.body;

    // If email is being updated, check if it's already in use
    if (input.email) {
      const existing = await this.storage.findByEmail(input.email);
      if (existing && existing.id !== id) {
        return reply.conflict(`Email ${input.email} is already in use`);
      }
    }

    const birthday = await this.storage.update(id, input);

    if (!birthday) {
      return reply.notFound(`Birthday with id ${id} not found`);
    }

    return birthday;
  });

  // Delete a birthday
  fastify.delete<{ Params: { id: string } }>('/birthdays/:id', async function (request, reply) {
    const { id } = request.params;
    const deleted = await this.storage.delete(id);

    if (!deleted) {
      return reply.notFound(`Birthday with id ${id} not found`);
    }

    return reply.code(204).send();
  });

  // Get upcoming birthdays
  fastify.get<{ Querystring: { days?: string } }>('/birthdays/upcoming', async function (request) {
    const days = request.query.days ? parseInt(request.query.days, 10) : 30;
    const birthdays = await this.storage.getUpcomingBirthdays(days);
    return { birthdays, days };
  });
}
