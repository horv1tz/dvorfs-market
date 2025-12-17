import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('wishlists', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.uuid('product_id').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.unique(['user_id', 'product_id']); // One wishlist entry per user per product
    table.index('user_id');
    table.index('product_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('wishlists');
}



