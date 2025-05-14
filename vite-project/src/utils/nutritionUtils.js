// src/utils/nutritionUtils.js
/**
 * Utility functions for nutrition calculations
 */

// Default serving size in grams
export const DEFAULT_SERVING_SIZE = 150;

/**
 * Convert nutrition values from one weight unit to another
 * @param {Object} nutrition - Nutrition values
 * @param {number} fromWeight - Original weight in grams
 * @param {number} toWeight - Target weight in grams
 * @returns {Object} - Converted nutrition values
 */
export const convertNutritionByWeight = (nutrition, fromWeight, toWeight) => {
  if (!nutrition || fromWeight === 0) return nutrition;
  
  const ratio = toWeight / fromWeight;
  
  return {
    ...nutrition,
    calories: Math.round((nutrition.calories || 0) * ratio),
    protein: parseFloat(((nutrition.protein || 0) * ratio).toFixed(1)),
    carbs: parseFloat(((nutrition.carbs || 0) * ratio).toFixed(1)),
    fat: parseFloat(((nutrition.fat || 0) * ratio).toFixed(1)),
    fiber: parseFloat(((nutrition.fiber || 0) * ratio).toFixed(1))
  };
};

/**
 * Format nutrition values to have consistent decimal places
 * @param {Object} nutrition - Nutrition values
 * @returns {Object} - Formatted nutrition values
 */
export const formatNutritionValues = (nutrition) => {
  if (!nutrition) return nutrition;
  
  return {
    ...nutrition,
    calories: Math.round(nutrition.calories || 0),
    protein: parseFloat((nutrition.protein || 0).toFixed(1)),
    carbs: parseFloat((nutrition.carbs || 0).toFixed(1)),
    fat: parseFloat((nutrition.fat || 0).toFixed(1)),
    fiber: parseFloat((nutrition.fiber || 0).toFixed(1))
  };
};

/**
 * Get serving size text
 * @param {number} grams - Weight in grams
 * @param {string} name - Name of serving (e.g., 'katori')
 * @returns {string} - Formatted serving size text
 */
export const getServingSizeText = (grams, name = 'katori') => {
  return `${grams}g (1 ${name})`;
};