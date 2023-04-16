import { knex as setupKnex, Knex } from 'knex'
import { env } from './env'

export const config = {
  client: env.DATABASE_CLIENT,
  connection:
    env.DATABASE_CLIENT === 'sqlite'
      ? {
          filename: env.DATABASE_URL,
        }
      : env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations',
  },
} as Knex.Config

export const knex = setupKnex(config)
