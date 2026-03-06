/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable("Orcamentos", table => {
    table.increments("id").primary();
    table.string("nome").notNullable().unique();
    table.timestamp("dataCriacao").defaultTo(knex.fn.now());
    table.string("status").notNullable();
    table.decimal("valorTotalItens", 14, 2).notNullable().defaultTo(0);
    table.integer("projetoId").unsigned().references("id").inTable("Projetos").onDelete("CASCADE").notNullable();
    
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists("Orcamentos");
};