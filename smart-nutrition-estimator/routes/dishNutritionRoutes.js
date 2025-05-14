import { Router } from 'express';
import { calculateDishNutrition } from '../controllers/nutritionCalculator.js';

const router = Router();

/**
 * @route POST /api/calculate-nutrition
 * @desc Calculate nutrition values for a dish based on its ingredients
 * @body {dishName} - Name of the dish
 */
router.post('/calculate-nutrition', calculateDishNutrition);

export default router;