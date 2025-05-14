import axios from 'axios';
import { config } from '../config/env.js';

/**
 * Service to calculate nutrition information for ingredients
 */
export class NutritionService {
  constructor() {
    // You could use a nutrition API like Edamam, Nutritionix, USDA, etc.
    this.apiBaseUrl = 'https://api.example.com/nutrition';
    this.apiKey = config.nutritionApiKey;
  }

  /**
   * Get nutrition information for a single ingredient
   * @param {Object} ingredient - Ingredient object with name, quantity and unit
   * @returns {Promise<Object>} - Nutrition data for the ingredient
   */
  async getIngredientNutrition(ingredient) {
    try {
      // This is a placeholder implementation - replace with actual API call
      const response = await axios.get(`${this.apiBaseUrl}/foods`, {
        params: {
          query: ingredient.name,
          api_key: this.apiKey
        }
      });
      
      // Process the nutrition data based on quantity
      const nutritionData = response.data;
      const scaledNutrition = this.scaleNutritionByQuantity(
        nutritionData, 
        ingredient.quantity, 
        ingredient.unit
      );
      
      return {
        ingredient: ingredient.name,
        quantity: `${ingredient.quantity} ${ingredient.unit}`,
        nutrition: scaledNutrition
      };
    } catch (error) {
      console.error(`Error fetching nutrition for ${ingredient.name}:`, error.message);
      // Return default or empty nutrition data
      return {
        ingredient: ingredient.name,
        quantity: `${ingredient.quantity} ${ingredient.unit}`,
        nutrition: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0
        }
      };
    }
  }

  /**
   * Scale nutrition values based on quantity
   * @param {Object} nutritionData - Base nutrition data
   * @param {number} quantity - Ingredient quantity
   * @param {string} unit - Unit of measurement
   * @returns {Object} - Scaled nutrition values
   */
  scaleNutritionByQuantity(nutritionData, quantity, unit) {
    // This would contain logic to convert units and scale nutrition
    // For example, converting grams to standard serving sizes
    
    // Placeholder implementation
    return {
      calories: (nutritionData.calories || 0) * quantity,
      protein: (nutritionData.protein || 0) * quantity,
      carbohydrates: (nutritionData.carbs || 0) * quantity,
      fat: (nutritionData.fat || 0) * quantity
    };
  }

  /**
   * Calculate nutrition for a list of ingredients
   * @param {Array<Object>} ingredients - List of ingredient objects
   * @returns {Promise<Object>} - Combined nutrition data
   */
  async calculateDishNutrition(ingredients) {
    const nutritionPromises = ingredients.map(ingredient => 
      this.getIngredientNutrition(ingredient)
    );
    
    const ingredientNutrition = await Promise.all(nutritionPromises);
    
    // Calculate totals
    const totalNutrition = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0
    };
    
    ingredientNutrition.forEach(item => {
      totalNutrition.calories += item.nutrition.calories || 0;
      totalNutrition.protein += item.nutrition.protein || 0;
      totalNutrition.carbohydrates += item.nutrition.carbohydrates || 0;
      totalNutrition.fat += item.nutrition.fat || 0;
    });
    
    return {
      ingredients: ingredientNutrition,
      totalNutrition
    };
  }
}