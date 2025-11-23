// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
require('dotenv').config();

module.exports = {
  development: {
    client: process.env.DB_CLIENT || 'pg',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: String(process.env.DB_PASSWORD || ''),
      database: process.env.DB_NAME || 'shopdb'
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};

