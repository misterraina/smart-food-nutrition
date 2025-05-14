// db.js
import pg from 'pg';
import { config } from './env.js';

const { Pool } = pg;

// Create a connection pool
const pool = new Pool(config.dbConfig);

// Test the connection
pool.connect()
  .then(() => console.log('✅ Supabase database connected successfully'))
  .catch(err => console.error('Supabase database connection error:', err));

export default pool;