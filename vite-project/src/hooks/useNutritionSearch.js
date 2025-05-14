// src/hooks/useNutritionSearch.js
import { useState } from 'react';
import { nutritionService } from '../services/api';

/**
 * Custom hook for searching nutrition data
 * @returns {Object} - Methods and state for nutrition search
 */
export function useNutritionSearch() {
  const [nutritionData, setNutritionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculatingWithAI, setCalculatingWithAI] = useState(false);
  
  /**
   * Search for nutrition data for a given dish
   * @param {string} dish - The dish to search for
   */
  const searchDish = async (dish) => {
    console.log("Searching for dish:", dish);
    setLoading(true);
    setError('');
    setNutritionData(null);
    setCalculatingWithAI(false);
    
    try {
      // First try to get the dish from the database
      try {
        const data = await nutritionService.searchFood(dish);
        setNutritionData(data);
      } catch (dbErr) {
        // If it's not found in the database, try with AI
        if (dbErr.message === 'FOOD_NOT_FOUND') {
          console.log("Item not found in database, calculating with AI...");
          setCalculatingWithAI(true);
          
          try {
            const aiData = await nutritionService.calculateWithAI(dish);
            setNutritionData(aiData);
          } catch (aiErr) {
            console.error("Error calculating with AI:", aiErr);
            setError("Unable to calculate nutrition. The dish name may be misspelled or our AI service is temporarily unavailable. Please try again with a different dish.");
          }
        } else {
          // If it's another error, throw it to be caught by the outer catch
          throw dbErr;
        }
      }
    } catch (err) {
      console.error("Error in search flow:", err);
      setError("Error fetching nutrition data. Please try again later.");
    } finally {
      setLoading(false);
      setCalculatingWithAI(false);
    }
  };
  
  /**
   * Reset the nutrition data state
   */
  const resetNutritionData = () => {
    setNutritionData(null);
    setError('');
  };
  
  return {
    nutritionData,
    loading,
    error,
    calculatingWithAI,
    searchDish,
    resetNutritionData
  };
}