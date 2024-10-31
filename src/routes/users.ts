import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { randomUUID } from 'node:crypto';

export async function usersRoutes(app: FastifyInstance) {
    app.post('/', async (request, reply) => {
        const createUserBodySchema = z.object({
            name: z.string(),
            email: z.string().email(),
        });

        const { name, email } = createUserBodySchema.parse(request.body);

        const userInDatabase = await knex('users')
            .where('email', email)
            .select('*');

        if (userInDatabase.length > 0) {
            return reply.status(409).send();
        }

        const sessionId = randomUUID();

        reply.cookie('sessionId', sessionId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        console.log(sessionId);

        await knex('users')
            .insert({
                id: randomUUID(),
                name: name,
                email: email,
                session_id: sessionId
            });

        return reply.status(201).send();
    });
};