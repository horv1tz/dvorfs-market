import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('categories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('slug').unique().notNullable();
    table.uuid('parent_id').nullable();
    table.string('image_url').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.foreign('parent_id').references('id').inTable('categories').onDelete('SET NULL');
    table.index('slug');
    table.index('parent_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('categories');
}

