import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('cart_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('cart_id').notNullable();
    table.uuid('product_id').notNullable();
    table.integer('quantity').notNullable().defaultTo(1);
    table.decimal('price', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.foreign('cart_id').references('id').inTable('carts').onDelete('CASCADE');
    table.unique(['cart_id', 'product_id']); // One item per product per cart
    table.index('cart_id');
    table.index('product_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('cart_items');
}

