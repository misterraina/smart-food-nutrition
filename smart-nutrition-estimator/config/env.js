// env.js
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  geminiApiKey: process.env.GEMINI_API_KEY,
  dbConfig: {
    connectionString: process.env.DB_STRING,
    ssl: { rejectUnauthorized: false }
  }
};