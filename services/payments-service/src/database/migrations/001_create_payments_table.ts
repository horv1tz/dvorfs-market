import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('payments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('order_id').notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    table.enum('status', ['pending', 'processing', 'completed', 'failed', 'refunded']).defaultTo('pending');
    table.enum('payment_method', ['stripe', 'yookassa']).notNullable();
    table.string('transaction_id').nullable();
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index('order_id');
    table.index('transaction_id');
    table.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('payments');
}

