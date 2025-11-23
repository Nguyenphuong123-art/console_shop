/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('orders', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('SET NULL');
    table.integer('quantity').unsigned().defaultTo(1);
    table.string('payment_receipt'); // lưu mã/đường dẫn phiếu thanh toán
    table.string('shipping_address');
    table.string('status').defaultTo('pending');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('orders');
};
