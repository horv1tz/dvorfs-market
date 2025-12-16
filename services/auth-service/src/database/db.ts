import knex, { Knex } from 'knex';
const config = require('../../knexfile');

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

export const db: Knex = knex(dbConfig);

// Test connection
db.raw('SELECT 1')
  .then(() => {
    console.log('Database connection established');
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });

