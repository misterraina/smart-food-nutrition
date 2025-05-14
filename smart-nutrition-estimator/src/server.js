import express from 'express';
import cors from 'cors';
import { config } from '../config/env.js';
import sabziRoutes from '../routes/sabziRoutes.js';
import nutritionRoutes from '../routes/nutritionRoutes.js';
import dishNutritionRoutes from '../routes/dishNutritionRoutes.js';
import { errorHandler } from '../middlewares/errorHandler.js';

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', nutritionRoutes);
app.use('/api', dishNutritionRoutes);
app.use('/api/get-ingredients', sabziRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('VYB Nutrition API is running');
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});