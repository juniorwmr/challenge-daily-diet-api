import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('snacks', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.string('description').notNullable()
    table.timestamp('create_at').defaultTo(knex.fn.now()).notNullable()
    table.boolean('on_diet').defaultTo(false).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('snacks')
}
