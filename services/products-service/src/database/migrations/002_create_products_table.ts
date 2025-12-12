import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('slug').unique().notNullable();
    table.text('description').nullable();
    table.decimal('price', 10, 2).notNullable();
    table.integer('stock').defaultTo(0);
    table.enum('type', ['physical', 'digital']).notNullable();
    table.uuid('category_id').nullable();
    table.jsonb('images').defaultTo('[]');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.foreign('category_id').references('id').inTable('categories').onDelete('SET NULL');
    table.index('slug');
    table.index('category_id');
    table.index('type');
    table.index('price');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('products');
}

