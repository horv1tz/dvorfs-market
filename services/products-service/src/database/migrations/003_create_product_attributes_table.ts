import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('product_attributes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('product_id').notNullable();
    table.string('attribute_name').notNullable();
    table.text('attribute_value').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.index('product_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('product_attributes');
}

