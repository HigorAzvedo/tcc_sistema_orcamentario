/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable("Cargos", (table) => {
    table.dropColumn("salario");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable("Cargos", (table) => {
    table.decimal("salario", 10, 2).notNullable();
  });
};
