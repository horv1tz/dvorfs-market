import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.enum('role', ['user', 'admin']).defaultTo('user');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index('email');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}

