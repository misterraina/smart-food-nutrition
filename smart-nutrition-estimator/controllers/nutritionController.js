import { query } from '../services/dbService.js';

/**
 * Get nutrition information for a food item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} next - Express next middleware function
 */
export const getNutritionInfo = async (req, res, next) => {
  const { food_data } = req.query;
  
  if (!food_data) {
    return res.status(400).json({ error: 'food_data is required' });
  }
  
  try {
    const result = await query(
      'SELECT * FROM food_data WHERE LOWER(food_name) = LOWER($1)',
      [food_data]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'food_data not found' });
    }
    // console.log("ye wala chala ");
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};


/**
 * Get food name suggestions for autocomplete
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} next - Express next middleware function
 */
export const getFoodSuggestions = async (req, res, next) => {
  const { query: searchQuery } = req.query;
  
  if (!searchQuery) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  
  try {
    const result = await query(
      'SELECT food_name FROM food_data WHERE LOWER(food_name) LIKE LOWER($1) ORDER BY food_name LIMIT 10',
      [`${searchQuery}%`]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};