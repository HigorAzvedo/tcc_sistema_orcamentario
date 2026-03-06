/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.table("Maquinarios", table => {
    table.dropForeign("areaId");
    table.dropColumn("areaId");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.table("Maquinarios", table => {
    table.integer("areaId").unsigned().references("id").inTable("Areas").onDelete("CASCADE").notNullable();
  });
};
