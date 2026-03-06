/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable("OrcamentistaCliente", table => {
    table.increments("id").primary();
    table.integer("orcamentistaId").unsigned().notNullable()
      .references("id").inTable("Orcamentistas").onDelete("CASCADE");
    table.integer("clienteId").unsigned().notNullable()
      .references("id").inTable("Cliente").onDelete("CASCADE");
    table.timestamps(true, true);
    
    // Garantir que não haja duplicatas
    table.unique(['orcamentistaId', 'clienteId']);
    table.index("orcamentistaId");
    table.index("clienteId");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists("OrcamentistaCliente");
};
