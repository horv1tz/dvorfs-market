import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('reviews', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('product_id').notNullable();
    table.uuid('user_id').notNullable();
    table.integer('rating').notNullable().checkBetween([1, 5]);
    table.text('comment').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.unique(['product_id', 'user_id']); // One review per user per product
    table.index('product_id');
    table.index('user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('reviews');
}



