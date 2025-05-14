// src/App.js
import React, { useState } from 'react';
import SearchBox from './components/SearchBox';
import NutritionCard from './components/NutritionCard';
import ServingSizeSelector from './components/ServingSizeSelector/ServingSizeSelector';
import LoadingSpinner from './components/Ui/LoadingSpinner';
import { useNutritionSearch } from './hooks/useNutritionSearch';
import { DEFAULT_SERVING_SIZE, convertNutritionByWeight } from './utils/nutritionUtils';

function App() {
  const [servingSize, setServingSize] = useState(DEFAULT_SERVING_SIZE);
  const [originalData, setOriginalData] = useState(null);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  
  const {
    nutritionData,
    loading,
    error,
    calculatingWithAI,
    searchDish
  } = useNutritionSearch();
  
  // When nutritionData changes from a new search, update the originalData
  React.useEffect(() => {
    if (nutritionData) {
      setOriginalData(nutritionData);
    }
  }, [nutritionData]);
  
  // Get the adjusted nutrition data based on serving size
  const adjustedNutritionData = React.useMemo(() => {
    if (!originalData) return null;
    
    // Extract original serving size value (default to DEFAULT_SERVING_SIZE if not found)
    const originalServingSizeText = originalData.serving_size || `${DEFAULT_SERVING_SIZE}g (1 katori)`;
    const originalServingSize = parseInt(originalServingSizeText) || DEFAULT_SERVING_SIZE;
    
    // If the serving size hasn't changed, return the original data
    if (servingSize === originalServingSize) {
      return originalData;
    }
    
    // Convert nutrition values based on new serving size
    const converted = convertNutritionByWeight(originalData, originalServingSize, servingSize);
    
    // Update the serving size text
    return {
      ...converted,
      serving_size: `${servingSize}g (1 katori)`
    };
  }, [originalData, servingSize]);
  
  const handleDishSearch = async (dish) => {
    setLastSearchQuery(dish);
    await searchDish(dish);
  };
  
  const handleServingSizeChange = (newSize) => {
    setServingSize(newSize);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-2xl font-semibold mb-4">VYB Nutrition Estimator</h1>
      
      <SearchBox onSearch={handleDishSearch} />
      
      {loading && <LoadingSpinner />}
      {calculatingWithAI && <p className="mt-2 text-amber-600">Calculating with AI - this may take up to 15 seconds...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
      
      {adjustedNutritionData && (
        <div className="w-full max-w-md">
          <div className="mt-4 flex justify-end">
            <ServingSizeSelector 
              currentSize={servingSize} 
              onChange={handleServingSizeChange} 
            />
          </div>
          <NutritionCard data={adjustedNutritionData} />
        </div>
      )}
    </div>
  );
}

export default App;