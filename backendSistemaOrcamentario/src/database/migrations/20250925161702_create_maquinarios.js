/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable("Maquinarios", (table) => {
    table.increments("id").primary();
    table.string("nome").notNullable();
    table.string("descricao").notNullable();
    table.decimal("valor", 10, 2).notNullable();
    table.integer("areaId").unsigned().references("id").inTable("Areas").onDelete("CASCADE").notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists("Maquinarios")
};
