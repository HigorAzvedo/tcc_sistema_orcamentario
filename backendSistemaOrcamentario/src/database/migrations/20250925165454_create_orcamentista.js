/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
   await knex.schema.createTable("Orcamentistas", table => {
    table.increments("id").primary();
    table.string("nome").notNullable();
    table.string("email").notNullable();
    table.string("matricula").notNullable();
    table.timestamps(true, true);
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists("Orcamentistas");
};
