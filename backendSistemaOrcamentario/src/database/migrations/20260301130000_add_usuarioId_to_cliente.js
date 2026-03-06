/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.table("Cliente", table => {
    table.integer("usuarioId").unsigned().references("id").inTable("Usuarios").onDelete("SET NULL");
    table.index("usuarioId");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.table("Cliente", table => {
    table.dropForeign("usuarioId");
    table.dropColumn("usuarioId");
  });
};
