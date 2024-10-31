import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { checkSessionIdExists } from '../middlewares/checkSessionIdExists';

export async function mealsRoutes(app: FastifyInstance) {
    app.get('/', {
        preHandler: [checkSessionIdExists],
    }, async (request, reply) => {
        const meals = await knex('meals')
            .where({ user_id: request.user?.id })
            .select('*');

        return reply.send(meals);
    });

    app.post('/', {
        preHandler: [checkSessionIdExists],
    }, async (request, reply) => {
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            in_diet: z.boolean(),
            datetime: z.string(),
        });

        const { name, description, in_diet, datetime } = createMealBodySchema.parse(request.body);

        await knex('meals')
            .insert({
                id: randomUUID(),
                name: name,
                description: description,
                in_diet: in_diet,
                datetime: datetime,
                user_id: request.user?.id,
            });

        return reply.status(201).send();
    });

    app.get('/:id', {
        preHandler: [checkSessionIdExists],
    }, async (request, reply) => {
        const getMealParamsSchema = z.object({
            id: z.string().uuid(),
        });

        const { id } = getMealParamsSchema.parse(request.params);

        const meal = await knex('meals')
            .where('id', id)
            .select('*')
            .first();

        if (!meal) {
            return reply.status(404).send();
        }

        return meal;
    });

    app.put('/:id', {
        preHandler: [checkSessionIdExists],
    }, async (request, reply) => {
        const updateMealParamsSchema = z.object({
            id: z.string(),
        });

        const updateMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            in_diet: z.boolean(),
            datetime: z.string(),
        });

        const { name, description, in_diet, datetime } = updateMealBodySchema.parse(request.body);

        const { id } = updateMealParamsSchema.parse(request.params);

        await knex('meals')
            .where('id', id)
            .update({
                name: name,
                description: description,
                in_diet: in_diet,
                datetime: datetime,
                user_id: request.user?.id,
            });

        return reply.status(204).send();
    });

    app.delete('/:id', {
        preHandler: [checkSessionIdExists],
    }, async (request, reply) => {
        const deleteMealParamsSchema = z.object({
            id: z.string().uuid(),
        });

        const { id } = deleteMealParamsSchema.parse(request.params);

        await knex('meals')
            .where('id', id)
            .delete();

        return reply.status(204).send();
    });

    app.get('/summary', {
        preHandler: [checkSessionIdExists],
    }, async (request, reply) => {
        const totalMealsOnDiet = await knex('meals')
            .where({ user_id: request.user?.id, in_diet: true })
            .count('id', { as: 'total' })
            .first()

        const totalMealsOffDiet = await knex('meals')
            .where({ user_id: request.user?.id, in_diet: false })
            .count('id', { as: 'total' })
            .first()

        const totalMeals = await knex('meals')
            .where({ user_id: request.user?.id })
            .orderBy('datetime', 'desc')

        const { bestOnDietSequence } = totalMeals.reduce(
            (acc, meal) => {
                if (meal.in_diet) {
                    acc.currentSequence += 1
                } else {
                    acc.currentSequence = 0
                }

                if (acc.currentSequence > acc.bestOnDietSequence) {
                    acc.bestOnDietSequence = acc.currentSequence
                }

                return acc
            },
            { bestOnDietSequence: 0, currentSequence: 0 },
        )

        return reply.send({
            totalMeals: totalMeals.length,
            totalMealsOnDiet: totalMealsOnDiet?.total,
            totalMealsOffDiet: totalMealsOffDiet?.total,
            bestOnDietSequence,
        })
    });
}