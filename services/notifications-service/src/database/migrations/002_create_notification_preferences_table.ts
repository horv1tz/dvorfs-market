import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('notification_preferences', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').unique().notNullable();
    table.boolean('email_enabled').defaultTo(true);
    table.boolean('push_enabled').defaultTo(true);
    table.jsonb('email_preferences').nullable(); // Per-type preferences
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index('user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('notification_preferences');
}

