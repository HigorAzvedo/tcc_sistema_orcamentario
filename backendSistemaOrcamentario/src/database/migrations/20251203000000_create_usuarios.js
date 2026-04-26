exports.up = function(knex) {
    return knex.schema.createTable('Usuarios', function(table) {
        table.increments('id').primary();
        table.string('nome', 255).notNullable();
        table.string('email', 255).notNullable().unique();
        table.string('senha', 255).notNullable();
        table.string('role', 50).defaultTo('user');
        table.boolean('ativo').defaultTo(true);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        
        table.index('email');
        table.index('role');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('Usuarios');
};
