require('dotenv').config();

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "sistema_orcamentario"
    },
    migrations: {
      directory: "./src/database/migrations"
    },
    seeds: {
      directory: "./src/database/seeds"
    }
  }
};

// npx knex migrate:make    create_projeto criar arquivo de migration
// npx knex migrate:latest   criar tabela
// npx knex migrate:rollback    apagar tabela

// Para reverter o último lote de migrações: $ knex migrate:rollback

// Para reverter todas as migrações concluídas: $ knex migrate:rollback --all

// Para executar a próxima migração que ainda não foi executada: $ knex migrate:up

// Para executar a migração especificada que ainda não foi executada:  $ knex migrate:up 001_migration_name.js

// Para desfazer a última migração executada: $ knex migrate:down

// Para desfazer a migração especificada que foi executada: $ knex migrate:down 001_migration_name.js


//jdbc:mysql://mysql669.umbler.com

//mysql669.umbler.com:41890 
