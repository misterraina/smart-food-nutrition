import { Router } from 'express';
import { 
  getNutritionInfo,  
  getFoodSuggestions 
} from '../controllers/nutritionController.js';

const router = Router();

/**
 * @route GET /api/nutrition
 * @desc Get nutrition information for a food item
 * @query {food_data} - Name of the food item
 */
router.get('/nutrition', getNutritionInfo);


/**
 * @route GET /api/suggestions
 * @desc Get food name suggestions for autocomplete
 * @query {query} - Search query for food names
 */
router.get('/suggestions', getFoodSuggestions);

export default router;