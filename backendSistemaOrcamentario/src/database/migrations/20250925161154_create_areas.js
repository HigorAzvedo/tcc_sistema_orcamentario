/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
   await knex.schema.createTable("Areas", table => {
    table.increments("id").primary();
    table.string("nome").notNullable();
   })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists("Areas")
};
