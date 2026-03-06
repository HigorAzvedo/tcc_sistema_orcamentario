/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
   await knex.schema.createTable("Materiais", table => {
    table.increments("id").primary();
    table.string("nome").notNullable();
    table.text("descricao").notNullable();
    table.string("unidadeMedida").notNullable();
    table.integer("areaId").unsigned().references("id").inTable("Areas").onDelete("CASCADE").notNullable();
    table.timestamps(true, true);
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists("Materiais");
};
