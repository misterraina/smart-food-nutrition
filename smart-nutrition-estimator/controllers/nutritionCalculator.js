import { getGeminiResponse } from '../services/aiService.js';
import { query } from '../services/dbService.js';
import { parseIngredientsFromResponse } from './sabziController.js';

/**
 * Controller to calculate nutrition values for a dish
 * @param {Object} req - Express request object containing dishName in body
 * @param {Object} res - Express response object
 * @param {Object} next - Express next middleware function
 */
export const calculateDishNutrition = async (req, res, next) => {
  const { dishName } = req.body;

  if (!dishName) {
    return res.status(400).json({ error: 'dishName is required' });
  }

  try {
    // Step 1: Get ingredients from AI service
    const prompt = `Give me the all the ingredients required to cook 1kg of ${dishName} with specific quantities. 
    For each ingredient, list the name followed by the quantity and any notes.
    Format each ingredient on a new line with a plus sign or bullet point.`;

    const aiResponseText = await getGeminiResponse(prompt);
    const ingredients = parseIngredientsFromResponse(aiResponseText);

    // Step 2: Calculate nutrition for each ingredient
    const nutritionPromises = ingredients.map(async (ingredient) => {
      // Try to find ingredient in database
      const foodName = ingredient.name.toLowerCase();
      let nutritionResult = await query(
        'SELECT * FROM food_data WHERE LOWER(food_name) = LOWER($1)',
        [foodName]
      );

      // If not found, try partial match
      if (nutritionResult.rows.length === 0) {
        // Extract first word of ingredient name (e.g., "red onion" -> "onion")
        const simplifiedName = foodName.split(' ').pop();
        
        nutritionResult = await query(
          'SELECT * FROM food_data WHERE LOWER(food_name) = LOWER($1)',
          [simplifiedName]
        );
      }

      // If still not found, try LIKE query
      if (nutritionResult.rows.length === 0) {
        const words = foodName.split(' ');
        for (const word of words) {
          // Skip common adjectives and articles
          if (['fresh', 'dried', 'chopped', 'sliced', 'a', 'the', 'and', 'or'].includes(word)) {
            continue;
          }
          
          nutritionResult = await query(
            'SELECT * FROM food_data WHERE LOWER(food_name) LIKE $1',
            [`%${word}%`]
          );
          
          if (nutritionResult.rows.length > 0) {
            break;
          }
        }
      }

      // If we found nutrition data
      if (nutritionResult.rows.length > 0) {
        const nutritionData = nutritionResult.rows[0];
        
        // Convert quantity to grams for consistent calculation
        let quantityInGrams = convertToGrams(ingredient.quantity, ingredient.unit, nutritionData.food_name);
        
        // Use a default value if conversion fails
        if (quantityInGrams === null) {
          // Default to 50g if we can't convert (better than returning null)
          quantityInGrams = 50;
          console.log(`Warning: Using default 50g for ${ingredient.name} due to unit conversion failure`);
        }
        
        // Calculate scaled nutrition values based on quantity
        const scaleFactor = quantityInGrams / 100; // Assuming nutrition data is per 100g
        
        // Ensure all nutrition values exist (use 0 if null/undefined)
        return {
          ingredient: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          rawDescription: ingredient.rawDescription,
          matched_food: nutritionData.food_name,
          quantityInGrams,
          nutrition: {
            calories: Math.round((nutritionData.energy_kj || 0) * scaleFactor * 10) / 10,
            protein_g: Math.round((nutritionData.protein_g || 0) * scaleFactor * 10) / 10,
            carbohydrates_g: Math.round((nutritionData.carbohydrates_g || 0) * scaleFactor * 10) / 10,
            fat_g: Math.round((nutritionData.fat_g || 0) * scaleFactor * 10) / 10,
            fiber_g: Math.round((nutritionData.fiber_g || 0) * scaleFactor * 10) / 10,
            sugar_g: Math.round((nutritionData.sugar_g || 0) * scaleFactor * 10) / 10
          }
        };
      }
      
      // For ingredients without nutrition data, use generic estimates
      // This is better than returning null values
      return {
        ingredient: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        rawDescription: ingredient.rawDescription,
        matched_food: null,
        quantityInGrams: estimateQuantity(ingredient),
        nutrition: estimateNutrition(ingredient)
      };
    });

    const ingredientsWithNutrition = await Promise.all(nutritionPromises);
    
    // Step 3: Calculate total nutrition
    const totalNutrition = calculateTotalNutrition(ingredientsWithNutrition);
    
    res.json({
      dish: dishName,
      totalNutrition,
      ingredients: ingredientsWithNutrition,
      rawIngredientsResponse: aiResponseText
    });
  } catch (error) {
    console.error("Error calculating dish nutrition:", error);
    next(error);
  }
};

/**
 * Helper function to calculate total nutrition from ingredients
 * @param {Array} ingredients - Array of ingredients with nutrition data
 * @returns {Object} - Total nutrition values
 */
const calculateTotalNutrition = (ingredients) => {
  const total = {
    calories: 0,
    protein_g: 0,
    carbohydrates_g: 0,
    fat_g: 0,
    fiber_g: 0,
    sugar_g: 0
  };
  
  let validNutritionCount = 0;
  
  ingredients.forEach(ingredient => {
    if (ingredient.nutrition) {
      validNutritionCount++;
      
      // Ensure we're adding numbers, not null/undefined values
      total.calories += ingredient.nutrition.calories || 0;
      total.protein_g += ingredient.nutrition.protein_g || 0;
      total.carbohydrates_g += ingredient.nutrition.carbohydrates_g || 0;
      total.fat_g += ingredient.nutrition.fat_g || 0;
      total.fiber_g += ingredient.nutrition.fiber_g || 0;
      total.sugar_g += ingredient.nutrition.sugar_g || 0;
    }
  });
  
  // Round values for cleaner output
  return {
    calories: Math.round(total.calories * 10) / 10,
    protein_g: Math.round(total.protein_g * 10) / 10,
    carbohydrates_g: Math.round(total.carbohydrates_g * 10) / 10,
    fat_g: Math.round(total.fat_g * 10) / 10,
    fiber_g: Math.round(total.fiber_g * 10) / 10,
    sugar_g: Math.round(total.sugar_g * 10) / 10,
    ingredient_match_rate: `${validNutritionCount}/${ingredients.length}`
  };
};

/**
 * Helper function to convert various units to grams
 * @param {number} quantity - Quantity value
 * @param {string} unit - Unit of measurement
 * @param {string} foodName - Name of the food for specific conversions
 * @returns {number|null} - Quantity in grams or null if conversion not possible
 */
const convertToGrams = (quantity, unit, foodName) => {
  if (quantity === null || quantity === undefined) {
    return null;
  }
  
  // Normalize unit to lowercase and singular form
  const normalizedUnit = unit ? unit.toLowerCase().replace(/s$/, '') : '';
  
  // Standard conversion rates
  const conversionRates = {
    g: 1,
    gram: 1,
    kg: 1000,
    kilogram: 1000,
    oz: 28.35,
    ounce: 28.35,
    lb: 453.592,
    pound: 453.592,
    tbsp: 15,
    tablespoon: 15,
    tsp: 5,
    teaspoon: 5,
    cup: 240,
    ml: 1,
    milliliter: 1,
    l: 1000,
    liter: 1000,
    piece: 50, // Generic estimate
    pc: 50,
    pinch: 0.5,
    dash: 0.5
  };
  
  // Special conversion rates based on food types
  const specialConversions = {
    // Produce/Vegetables
    onion: { medium: 110, large: 150, small: 70, clove: 5, whole: 110 },
    tomato: { medium: 123, large: 182, small: 91, whole: 123 },
    potato: { medium: 213, large: 295, small: 170, whole: 213 },
    carrot: { medium: 61, large: 72, small: 50, whole: 61 },
    garlic: { clove: 5, head: 50, bulb: 50 },
    ginger: { inch: 15, piece: 30 },
    
    // Spices
    salt: { tbsp: 17, tsp: 5.7, tablespoon: 17, teaspoon: 5.7, pinch: 0.5 },
    pepper: { tbsp: 7, tsp: 2.3, tablespoon: 7, teaspoon: 2.3, pinch: 0.5 },
    cumin: { tbsp: 7.5, tsp: 2.5, tablespoon: 7.5, teaspoon: 2.5, pinch: 0.5 },
    turmeric: { tbsp: 7, tsp: 2.3, tablespoon: 7, teaspoon: 2.3, pinch: 0.5 },
    
    // Dairy
    cheese: { cup: 250, slice: 30, tablespoon: 15 },
    paneer: { cup: 200, block: 200, piece: 50 },
    milk: { cup: 245, tablespoon: 15 },
    
    // Others
    rice: { cup: 185 },
    flour: { cup: 125 },
    butter: { tbsp: 14, tsp: 4.7, tablespoon: 14, teaspoon: 4.7, stick: 113 },
    oil: { tbsp: 13.5, tsp: 4.5, tablespoon: 13.5, teaspoon: 4.5 },
  };
  
  // Check if unit exists in standard conversion
  if (conversionRates[normalizedUnit]) {
    return quantity * conversionRates[normalizedUnit];
  }
  
  // Check for special food-specific conversions
  const lowerFoodName = foodName.toLowerCase();
  
  // Find matching food in special conversions
  for (const [food, conversions] of Object.entries(specialConversions)) {
    if (lowerFoodName.includes(food) && conversions[normalizedUnit]) {
      return quantity * conversions[normalizedUnit];
    }
  }
  
  // Handle size-based units generically
  if (normalizedUnit === 'medium') {
    return quantity * 100; // Generic medium item
  } else if (normalizedUnit === 'large') {
    return quantity * 150; // Generic large item
  } else if (normalizedUnit === 'small') {
    return quantity * 70;  // Generic small item
  } else if (normalizedUnit === 'handful') {
    return quantity * 30;  // Generic handful
  } else if (normalizedUnit === 'bunch') {
    return quantity * 100; // Generic bunch
  }
  
  // If no conversion found
  return null;
};

/**
 * Estimate quantity in grams when units are unknown
 * @param {Object} ingredient - Ingredient object
 * @returns {number} - Estimated quantity in grams
 */
const estimateQuantity = (ingredient) => {
  // Extract category hints from ingredient name
  const name = ingredient.name.toLowerCase();
  
  // Default to 50g if we have no quantity info
  if (!ingredient.quantity) return 50;
  
  // Try to make reasonable guesses based on ingredient type
  if (name.includes('spice') || name.includes('salt') || name.includes('pepper') || 
      name.includes('powder') || name.includes('masala')) {
    return ingredient.quantity * 5; // Spices typically used in small amounts
  } else if (name.includes('oil') || name.includes('sauce') || name.includes('vinegar')) {
    return ingredient.quantity * 15; // Liquids in small amounts
  } else if (name.includes('onion') || name.includes('tomato') || 
             name.includes('vegetable') || name.includes('fruit')) {
    return ingredient.quantity * 100; // Average vegetable/fruit
  } else if (name.includes('rice') || name.includes('flour') || name.includes('grain')) {
    return ingredient.quantity * 180; // Staples
  } else if (name.includes('cheese') || name.includes('paneer') || name.includes('tofu')) {
    return ingredient.quantity * 200; // Protein sources
  }
  
  // Generic fallback - better than null
  return ingredient.quantity * 50;
};

/**
 * Create estimated nutrition when no match found
 * @param {Object} ingredient - Ingredient object
 * @returns {Object} - Estimated nutrition values
 */
const estimateNutrition = (ingredient) => {
  const name = ingredient.name.toLowerCase();
  const estimatedGrams = estimateQuantity(ingredient);
  const scaleFactor = estimatedGrams / 100; // Per 100g
  
  // Default nutrition template
  let calories = 50;
  let protein = 2;
  let carbs = 5;
  let fat = 2;
  let fiber = 1;
  let sugar = 1;
  
  // Adjust based on ingredient type
  if (name.includes('oil') || name.includes('butter') || name.includes('ghee')) {
    calories = 900; protein = 0; carbs = 0; fat = 100; fiber = 0; sugar = 0;
  } else if (name.includes('spice') || name.includes('masala') || name.includes('powder')) {
    calories = 30; protein = 1; carbs = 5; fat = 1; fiber = 3; sugar = 0;
  } else if (name.includes('vegetable') || name.includes('onion') || name.includes('tomato')) {
    calories = 40; protein = 1; carbs = 8; fat = 0.5; fiber = 2; sugar = 3;
  } else if (name.includes('paneer') || name.includes('cheese')) {
    calories = 300; protein = 20; carbs = 4; fat = 25; fiber = 0; sugar = 1;
  } else if (name.includes('rice') || name.includes('grain') || name.includes('flour')) {
    calories = 350; protein = 7; carbs = 80; fat = 1; fiber = 2; sugar = 0;
  } else if (name.includes('sugar') || name.includes('honey') || name.includes('jaggery')) {
    calories = 400; protein = 0; carbs = 100; fat = 0; fiber = 0; sugar = 100;
  }
  
  return {
    calories: Math.round(calories * scaleFactor * 10) / 10,
    protein_g: Math.round(protein * scaleFactor * 10) / 10,
    carbohydrates_g: Math.round(carbs * scaleFactor * 10) / 10,
    fat_g: Math.round(fat * scaleFactor * 10) / 10,
    fiber_g: Math.round(fiber * scaleFactor * 10) / 10,
    sugar_g: Math.round(sugar * scaleFactor * 10) / 10
  };
};

// Export the parseIngredientsFromResponse function for use in other files
export { parseIngredientsFromResponse } from './sabziController.js';