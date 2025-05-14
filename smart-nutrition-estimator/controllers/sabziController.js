import { getGeminiResponse } from '../services/aiService.js';

/**
 * Specialized parser for the Gemini API response format
 * @param {string} aiResponseText - Text response from Gemini containing ingredients
 * @returns {Array<Object>} - Array of ingredient objects with name and quantity
 */
export const parseIngredientsFromResponse = (aiResponseText) => {
  const ingredients = [];
  
  // Format for bullet points using + or * followed by **Ingredient:** pattern
  const bulletRegex = /[\+\*]\s+\*\*([^:]+):\*\*\s+(.*?)(?=\n[\+\*]|\n*$)/gs;
  let matches = [...aiResponseText.matchAll(bulletRegex)];
  
  if (matches.length > 0) {
    // Process the structured matches
    for (const match of matches) {
      const name = match[1].trim();
      const quantityString = match[2].trim();
      
      // Extract quantity and unit
      const { quantity, unit } = extractQuantityAndUnit(quantityString);
      
      ingredients.push({
        name: name,
        quantity: quantity,
        unit: unit,
        rawDescription: quantityString
      });
    }
  } else {
    // Fallback to other formats if the new regex doesn't match
    
    // Format 1: ++Ingredient:++ pattern
    const format1Regex = /\+\+([^:]+):\+\+\s+(.*?)(?=\n\+\+|$)/gs;
    let format1Matches = [...aiResponseText.matchAll(format1Regex)];
    
    // Format 2: **Ingredient:** pattern (without bullet)
    const format2Regex = /\*\*([^:]+):\*\*\s+(.*?)(?=\n\*\*|$)/gs;
    let format2Matches = [...aiResponseText.matchAll(format2Regex)];
    
    matches = format1Matches.length > 0 ? format1Matches : 
             (format2Matches.length > 0 ? format2Matches : []);
             
    // If still no matches, try line-by-line approach
    if (matches.length === 0) {
      // Look for lines that might be ingredients (contain quantities)
      const lines = aiResponseText.split('\n');
      for (let line of lines) {
        // Skip empty lines or headings
        if (!line.trim() || line.toLowerCase().includes('ingredients')) continue;
        
        // Look for lines with numbers (likely quantities)
        const numericMatch = line.match(/(\d+)/);
        if (numericMatch) {
          // Try to split by colon or dash
          let parts = line.split(/:|–|-/);
          if (parts.length >= 2) {
            const name = parts[0].replace(/\*/g, '').trim();
            const quantityString = parts.slice(1).join(':').trim();
            
            ingredients.push({
              name: name,
              quantity: parseFloat(numericMatch[1]) || null,
              unit: determineUnit(quantityString),
              rawDescription: quantityString
            });
          }
        }
      }
    } else {
      // Process the structured matches from format1 or format2
      for (const match of matches) {
        const name = match[1].trim();
        const quantityString = match[2].trim();
        
        // Extract quantity and unit
        const { quantity, unit } = extractQuantityAndUnit(quantityString);
        
        ingredients.push({
          name: name,
          quantity: quantity,
          unit: unit,
          rawDescription: quantityString
        });
      }
    }
  }
  
  return ingredients;
};

/**
 * Helper function to extract quantity and unit from a description
 * @param {string} quantityString - Description containing quantity information
 * @returns {Object} - Object with quantity and unit
 */
const extractQuantityAndUnit = (quantityString) => {
  let quantity = null;
  let unit = '';
  
  // Handle special cases
  if (quantityString.toLowerCase().includes('to taste')) {
    return { quantity: null, unit: 'to taste' };
  } 
  
  if (quantityString.toLowerCase().includes('as needed')) {
    return { quantity: null, unit: 'as needed' };
  }
  
  // Extract numeric value - look for digits with potential dash or fraction
  const numericMatch = quantityString.match(/(\d+(?:-\d+)?(?:\/\d+)?|\d+\.\d+)/);
  
  if (numericMatch) {
    let extractedQuantity = numericMatch[1];
    
    // Handle ranges like "2-3" by taking the average
    if (extractedQuantity.includes('-')) {
      const [min, max] = extractedQuantity.split('-');
      quantity = (parseFloat(min) + parseFloat(max)) / 2;
    } else if (extractedQuantity.includes('/')) {
      // Handle fractions like "1/2"
      const [numerator, denominator] = extractedQuantity.split('/');
      quantity = parseFloat(numerator) / parseFloat(denominator);
    } else {
      quantity = parseFloat(extractedQuantity);
    }
    
    // Determine unit
    unit = determineUnit(quantityString);
  }
  
  return { quantity, unit };
};

/**
 * Helper function to determine the unit from a description
 * @param {string} description - Description containing unit information
 * @returns {string} - The unit
 */
const determineUnit = (description) => {
  const lowercaseDesc = description.toLowerCase();
  
  if (lowercaseDesc.includes('tablespoon')) return 'tbsp';
  if (lowercaseDesc.includes('teaspoon')) return 'tsp';
  if (lowercaseDesc.match(/\b\d+\s*g\b/) || lowercaseDesc.includes('gram') || (lowercaseDesc.match(/\d+g/) && !lowercaseDesc.includes('kg'))) return 'g';
  if (lowercaseDesc.includes('kg')) return 'kg';
  if (lowercaseDesc.includes('oz')) return 'oz';
  if (lowercaseDesc.includes('ml')) return 'ml';
  if (lowercaseDesc.includes('clove')) return 'clove';
  if (lowercaseDesc.includes('cup')) return 'cup';
  if (lowercaseDesc.includes('medium')) return 'medium';
  if (lowercaseDesc.includes('large')) return 'large';
  if (lowercaseDesc.includes('small')) return 'small';
  if (lowercaseDesc.includes('inch')) return 'inch';
  
  return '';
};

/**
 * Controller for the home page of the Sabzi API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getHomePage = (req, res) => {
  res.json({ message: 'Welcome to the Sabzi Ingredient API' });
};

/**
 * Controller to get sabzi ingredients using AI
 * @param {Object} req - Express request object containing sabziName in body
 * @param {Object} res - Express response object
 * @param {Object} next - Express next middleware function
 */
export const postSabzi = async (req, res, next) => {
  const { sabziName } = req.body;

  if (!sabziName) {
    return res.status(400).json({ error: 'sabziName is required' });
  }

  // Craft a clear prompt for the AI
  const prompt = `Give me the all the ingredients required to cook 1kg of ${sabziName} with specific quantities. 
  For each ingredient, list the name followed by the quantity and any notes.
  Format each ingredient on a new line with a plus sign or bullet point.`;

  try {
    const aiResponseText = await getGeminiResponse(prompt);
    const parsedIngredients = parseIngredientsFromResponse(aiResponseText);

    // Debug information
    console.log("AI Response:", aiResponseText);
    console.log("Parsed Ingredients:", parsedIngredients);

    res.json({
      sabzi: sabziName,
      rawIngredients: aiResponseText,
      ingredients: parsedIngredients
    });
  } catch (error) {
    console.error("Error:", error);
    next(error);
  }
};