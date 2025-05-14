// src/services/api.js with serving size conversion
import { DEFAULT_SERVING_SIZE, convertNutritionByWeight, getServingSizeText } from '../utils/nutritionUtils';

const API_BASE_URL = 'http://localhost:5000/api';

// Use the standard serving size from utils
const SERVING_SIZE_GRAMS = DEFAULT_SERVING_SIZE;

/**
 * Service for handling all API calls related to nutrition data
 */
export const nutritionService = {
  /**
   * Search for a food item in the database
   * @param {string} foodName - The name of the food to search for
   * @returns {Promise<Object>} - The nutrition data
   */
  async searchFood(foodName) {
    const response = await fetch(
      `${API_BASE_URL}/nutrition?food_data=${encodeURIComponent(foodName)}`
    );
    
    if (response.status === 404) {
      throw new Error('FOOD_NOT_FOUND');
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const data = await response.json();
    return this.formatDatabaseResponse(data);
  },
  
  /**
   * Calculate nutrition using AI
   * @param {string} dish - The dish to calculate nutrition for
   * @returns {Promise<Object>} - The calculated nutrition data
   */
  async calculateWithAI(dish) {
    try {
      console.log("Sending AI calculation request for:", dish);
      const response = await fetch(`${API_BASE_URL}/calculate-nutrition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dishName: dish })  // Changed 'dish' to 'dishName' to match backend
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI calculation failed with status:", response.status, errorText);
        throw new Error('Failed to calculate nutrition with AI');
      }
      
      const data = await response.json();
      return this.formatAIResponse(data, dish);
    } catch (error) {
      console.error("Error in calculateWithAI:", error);
      throw error;
    }
  },
  
  /**
   * Get food suggestions based on a search query
   * @param {string} query - The search query
   * @returns {Promise<Array>} - The food suggestions
   */
  async getFoodSuggestions(query) {
    const response = await fetch(
      `${API_BASE_URL}/suggestions?query=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }
    
    return response.json();
  },
  
  /**
   * Format database response to consistent format with per-katori values
   * @param {Object} data - The raw data from the database
   * @returns {Object} - The formatted nutrition data
   */
  formatDatabaseResponse(data) {
    // Database gives values per 100g, convert to per serving size (katori)
    const baseNutrition = {
      food_name: data.food_name,
      calories: data.energy_kcal || 0,
      protein: data.protein_g || 0,
      carbs: data.carb_g || 0,
      fat: data.fat_g || 0,
      fiber: data.fibre_g || 0,
      from_database: true
    };
    
    // Convert from 100g to serving size
    const perServingNutrition = convertNutritionByWeight(baseNutrition, 100, SERVING_SIZE_GRAMS);
    
    return {
      ...perServingNutrition,
      serving_size: getServingSizeText(SERVING_SIZE_GRAMS)
    };
  },
  
  /**
   * Format AI response to consistent format with per-katori values
   * @param {Object} data - The raw data from the AI
   * @param {string} dishName - The name of the dish
   * @returns {Object} - The formatted nutrition data
   */
  formatAIResponse(data, dishName) {
    // AI gives values per 1kg (1000g), convert to per serving size (katori)
    const baseNutrition = {
      food_name: dishName,
      calories: data.totalNutrition.calories || 0,
      protein: data.totalNutrition.protein_g || 0,
      carbs: data.totalNutrition.carbohydrates_g || 0,
      fat: data.totalNutrition.fat_g || 0,
      fiber: data.totalNutrition.fiber_g || 0,
      calculated_by_ai: true,
      ingredient_match_rate: data.totalNutrition.ingredient_match_rate || '0/0'
    };
    
    // Convert from 1000g to serving size
    const perServingNutrition = convertNutritionByWeight(baseNutrition, 1000, SERVING_SIZE_GRAMS);
    
    return {
      ...perServingNutrition,
      serving_size: getServingSizeText(SERVING_SIZE_GRAMS)
    };
  }
};