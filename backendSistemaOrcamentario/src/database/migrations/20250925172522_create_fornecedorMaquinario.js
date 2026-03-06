/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable("FornecedorMaquinario", table => {
    table.increments("id").primary();
    table.integer("fornecedorId").unsigned().references("id").inTable("Fornecedor").onDelete("CASCADE").notNullable();
    table.integer("maquinarioId").unsigned().references("id").inTable("Maquinarios").onDelete("CASCADE").notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists("FornecedorMaquinario");
};
