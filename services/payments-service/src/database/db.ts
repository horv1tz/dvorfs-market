import knex, { Knex } from 'knex';
import path from 'path';
import fs from 'fs';

const environment = process.env.NODE_ENV || 'development';

// Try to load knexfile from different possible locations
let config: any;
const possiblePaths = [
  path.resolve(__dirname, '../../knexfile.js'),
  path.resolve(__dirname, '../knexfile.js'),
  path.resolve(process.cwd(), 'knexfile.js'),
  path.resolve(process.cwd(), 'dist/knexfile.js'),
];

for (const configPath of possiblePaths) {
  if (fs.existsSync(configPath)) {
    config = require(configPath);
    console.log(`Loaded knexfile from: ${configPath}`);
    break;
  }
}

if (!config) {
  throw new Error('Could not find knexfile.js');
}

const dbConfig = config[environment];

export const db: Knex = knex(dbConfig);

// Test connection
db.raw('SELECT 1')
  .then(() => {
    console.log('Database connection established');
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

