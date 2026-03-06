/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Alterar a enum para incluir 'orcamentista'
  await knex.raw(`
    ALTER TABLE Usuarios 
    MODIFY COLUMN role ENUM('admin', 'user', 'manager', 'orcamentista') DEFAULT 'user'
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Reverter para a enum original
  await knex.raw(`
    ALTER TABLE Usuarios 
    MODIFY COLUMN role ENUM('admin', 'user', 'manager') DEFAULT 'user'
  `);
};
