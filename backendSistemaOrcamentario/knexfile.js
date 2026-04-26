require('dotenv').config();

const sharedMigrations = {
  directory: "./src/database/migrations"
};

const sharedSeeds = {
  directory: "./src/database/seeds"
};

const neonConnection = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    }
  : null;

module.exports = {
  development: {
    client: neonConnection ? "pg" : "mysql2",
    connection: neonConnection || {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "sistema_orcamentario"
    },
    migrations: sharedMigrations,
    seeds: sharedSeeds
  },
  production: {
    client: "pg",
    connection: neonConnection || {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: sharedMigrations,
    seeds: sharedSeeds
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
