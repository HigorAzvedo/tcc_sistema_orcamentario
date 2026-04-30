require('dotenv').config();

const dbProfile = process.env.DB_PROFILE ? process.env.DB_PROFILE.toLowerCase() : undefined;
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

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

const localConnection = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'sistema_orcamentario'
};

const resolveConnection = () => {
  if (dbProfile === 'local') {
    return localConnection;
  }

  if (hasDatabaseUrl && neonConnection) {
    return neonConnection;
  }

  return localConnection;
};

module.exports = {
  development: {
    client: "pg",
    connection: resolveConnection(),
    migrations: sharedMigrations,
    seeds: sharedSeeds
  },
  production: {
    client: "pg",
    connection: resolveConnection(),
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
