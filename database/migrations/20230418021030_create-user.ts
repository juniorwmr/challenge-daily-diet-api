import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary()
    table.string('username').notNullable()
    table.uuid('session_id').nullable().after('id').index()
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users')
}
