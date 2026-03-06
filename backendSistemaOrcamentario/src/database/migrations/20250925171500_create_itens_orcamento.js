/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable("ItensOrcamento", table => {
    table.increments("id").primary();
    
    table.decimal("valorUnitario", 10, 2).notNullable();
    table.decimal("quantidade", 10, 2).notNullable();
    table.decimal("valorTotal", 10, 2).notNullable();

    // FKs
    table.integer("idProjeto").unsigned().references("id").inTable("Projetos").onDelete("CASCADE").notNullable();
    table.integer("idOrcamento").unsigned().references("id").inTable("Orcamentos").onDelete("CASCADE").notNullable();
    
    table.integer("idMaterial").unsigned().references("id").inTable("Materiais").onDelete("SET NULL").nullable();
    table.integer("idCargo").unsigned().references("id").inTable("Cargos").onDelete("SET NULL").nullable();
    table.integer("idMaquinario").unsigned().references("id").inTable("Maquinarios").onDelete("SET NULL").nullable();

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists("ItensOrcamento");
};