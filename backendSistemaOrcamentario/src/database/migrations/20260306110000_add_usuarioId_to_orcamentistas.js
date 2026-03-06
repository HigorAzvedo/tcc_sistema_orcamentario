/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.table("Orcamentistas", table => {
    table.integer("usuarioId").unsigned().references("id").inTable("Usuarios").onDelete("CASCADE");
    table.index("usuarioId");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.table("Orcamentistas", table => {
    table.dropForeign("usuarioId");
    table.dropIndex("usuarioId");
    table.dropColumn("usuarioId");
  });
};
