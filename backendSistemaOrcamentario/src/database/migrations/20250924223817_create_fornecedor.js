/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
      await knex.schema.createTable("Fornecedor", (table) => {
    table.increments("id").primary();
    table.string("nome").notNullable();
    table.string("email").notNullable().unique();
    table.string("cnpj").notNullable().unique();
    table.string("telefone").notNullable().unique();
    table.string("endereco").notNullable();
  });
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists("Fornecedor")
};
