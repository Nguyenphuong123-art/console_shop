/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();                // Tên sản phẩm
    table.text('description');                         // Mô tả chi tiết
    table.decimal('price', 12, 2).notNullable();       // Giá bán
    table.integer('quantity').defaultTo(0);            // Số lượng tồn kho
    table.string('origin');                            // Xuất xứ
    table.string('brand');                             // Thương hiệu
    table.string('category');                          // Danh mục
    table.string('sku').unique();                      // Mã sản phẩm (SKU)
    table.jsonb('images');                             // Danh sách hình ảnh (mảng JSON)
    table.boolean('is_active').defaultTo(true);        // Trạng thái hiển thị
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('products');
}
