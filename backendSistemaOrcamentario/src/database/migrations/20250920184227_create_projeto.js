/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable("Projetos", table => {
    table.increments("id").primary();
    table.string("nome").notNullable();
    table.text("descricao").notNullable();
    table.date("dataInicio").notNullable();
    table.date("dataFim").notNullable();
    table.integer("clienteId").unsigned().references("id").inTable("Cliente").onDelete("CASCADE").notNullable();
    table.timestamps(true, true);
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists("Projetos");
};
