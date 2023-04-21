import { FastifyInstance } from 'fastify'
import { knex } from '../db'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { Knex } from 'knex'

export const snacksRoutes = async (app: FastifyInstance) => {
  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const sessionIdSchema = z.object({
        sessionId: z.string().uuid(),
      })

      const { sessionId } = sessionIdSchema.parse(request.cookies)
      const user = await knex('users').where({ session_id: sessionId }).first()

      if (!user) {
        return reply.status(403).send({
          status: 'error',
          data: 'Session ID does not exist',
        })
      }

      const data = await knex('snacks')
        .select()
        .count('snacks.id', {
          as: 'total',
        })

        // Buscar apenas os snacks que não estão na dieta
        .with('snacks_not_on_diet', (qb) => {
          qb.select('id').from('snacks').where({
            user_id: user.id,
            on_diet: false,
          })
        })
        .leftJoin('snacks_not_on_diet', 'snacks_not_on_diet.id', 'snacks.id')
        .count('snacks_not_on_diet.id', {
          as: 'not_on_diet',
        })

        // Buscar apenas os snacks que estão na dieta
        .with('snacks_on_diet', (qb) => {
          qb.select('id').from('snacks').where({
            user_id: user.id,
            on_diet: true,
          })
        })
        .leftJoin('snacks_on_diet', 'snacks_on_diet.id', 'snacks.id')
        .count('snacks_on_diet.id', {
          as: 'on_diet',
        })

        // Buscar a melhor sequência de refeições dentro da dieta
        .with('best_sequence', (qb: Knex.QueryBuilder) => {
          qb.count('*', {
            as: 'count',
          })
            .from((qb: Knex.QueryBuilder) => {
              qb.select('id', 'on_diet')
                .rowNumber('seqnum', function () {
                  this.orderBy('id').partitionBy('on_diet')
                })
                .from('snacks')
                .as('t')
                .where({
                  user_id: user.id,
                  on_diet: true,
                })
            })
            .groupBy('on_diet')
            .groupByRaw('(id - seqnum)')
            .orderBy('on_diet')
            .orderByRaw('count(*) desc')
            .limit(1)
        })
        .join('best_sequence', knex.raw('1 = 1'))
        .select('best_sequence.count as best_sequence')
        .groupBy('best_sequence.count')

        .where({
          user_id: user.id,
        })
        .first()

      return {
        status: 'success',
        data,
      }
    },
  )

  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const sessionIdSchema = z.object({
        sessionId: z.string().uuid(),
      })

      const { sessionId } = sessionIdSchema.parse(request.cookies)
      const user = await knex('users').where({ session_id: sessionId }).first()

      if (!user) {
        return reply.status(403).send({
          status: 'error',
          data: 'Session ID does not exist',
        })
      }

      const createUserBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        created_at: z.string().datetime(),
        on_diet: z.boolean().default(false),
      })

      const { name, description, created_at, on_diet } =
        createUserBodySchema.parse(request.body)

      const [snack] = await knex('snacks')
        .insert({
          name,
          description,
          created_at,
          on_diet,
          user_id: user.id,
        })
        .returning('*')

      return {
        status: 'success',
        data: snack,
      }
    },
  )

  app.put(
    '/:snackId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const sessionIdSchema = z.object({
        sessionId: z.string().uuid(),
      })

      const { sessionId } = sessionIdSchema.parse(request.cookies)
      const user = await knex('users').where({ session_id: sessionId }).first()

      if (!user) {
        return reply.status(403).send({
          status: 'error',
          data: 'Session ID does not exist',
        })
      }

      const createUserParamsSchema = z.object({
        snackId: z
          .number({
            coerce: true,
          })
          .int(),
      })
      const { snackId } = createUserParamsSchema.parse(request.params)

      const createUserBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        created_at: z.string().datetime(),
        on_diet: z.boolean().default(false),
      })

      const { name, description, created_at, on_diet } =
        createUserBodySchema.parse(request.body)

      const [snack] = await knex('snacks')
        .update({
          name,
          description,
          created_at,
          on_diet,
          user_id: user.id,
        })
        .where({
          id: snackId,
          user_id: user.id,
        })
        .returning('*')

      return {
        status: 'success',
        data: snack,
      }
    },
  )

  app.delete(
    '/:snackId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const sessionIdSchema = z.object({
        sessionId: z.string().uuid(),
      })

      const { sessionId } = sessionIdSchema.parse(request.cookies)
      const user = await knex('users').where({ session_id: sessionId }).first()

      if (!user) {
        return reply.status(403).send({
          status: 'error',
          data: 'Session ID does not exist',
        })
      }

      const createUserParamsSchema = z.object({
        snackId: z
          .number({
            coerce: true,
          })
          .int(),
      })
      const { snackId } = createUserParamsSchema.parse(request.params)

      const hasDeleted = await knex('snacks').delete().where({
        id: snackId,
        user_id: user.id,
      })

      return {
        status: 'success',
        data: (hasDeleted && snackId) || null,
      }
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const sessionIdSchema = z.object({
        sessionId: z.string().uuid(),
      })

      const { sessionId } = sessionIdSchema.parse(request.cookies)
      const user = await knex('users').where({ session_id: sessionId }).first()

      if (!user) {
        return reply.status(403).send({
          status: 'error',
          data: 'Session ID does not exist',
        })
      }

      const snacks = await knex('snacks').where({ user_id: user.id })

      return {
        status: 'success',
        data: snacks,
      }
    },
  )

  app.get(
    '/:snackId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const sessionIdSchema = z.object({
        sessionId: z.string().uuid(),
      })

      const { sessionId } = sessionIdSchema.parse(request.cookies)
      const user = await knex('users').where({ session_id: sessionId }).first()

      if (!user) {
        return reply.status(403).send({
          status: 'error',
          data: 'Session ID does not exist',
        })
      }

      const createUserParamsSchema = z.object({
        snackId: z
          .number({
            coerce: true,
          })
          .int(),
      })
      const { snackId } = createUserParamsSchema.parse(request.params)

      const [snack] = await knex('snacks').select().where({
        id: snackId,
        user_id: user.id,
      })

      return {
        status: 'success',
        data: snack || null,
      }
    },
  )
}
