exports.up = async function(knex) {
  await knex.schema.createTable("Cliente", (table) => {
    table.increments("id").primary();
    table.string("nome").notNullable();
    table.string("email").notNullable().unique();
    table.string("cpfCnpj").notNullable().unique();
    table.string("telefone");
    table.string("endereco");
    table.string("tipo");
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists("Cliente");
};
