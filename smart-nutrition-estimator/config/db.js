import pg from 'pg';
import { config } from './env.js';

const { Pool } = pg;

// Create a connection pool
const pool = new Pool(config.dbConfig);

// Test the connection
pool.connect()
  .then(() => console.log('✅ Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

export default pool;