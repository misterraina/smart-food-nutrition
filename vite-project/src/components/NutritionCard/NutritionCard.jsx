import React from 'react';

const StatusBadge = ({ type }) => {
  const badges = {
    from_database: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      label: 'From Database'
    },
    calculated_by_ai: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      label: 'AI Calculated'
    }
  };
  
  const badge = badges[type];
  if (!badge) return null;
  
  return (
    <span className={`${badge.bg} ${badge.text} text-xs px-2 py-1 rounded`}>
      {badge.label}
    </span>
  );
};

const NutritionCard = ({ data }) => {
  if (!data) return null;
  
  return (
    <div className="mt-6 bg-white p-6 rounded shadow-md w-full max-w-md">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">{data.food_name}</h2>
        {data.from_database && <StatusBadge type="from_database" />}
        {data.calculated_by_ai && <StatusBadge type="calculated_by_ai" />}
      </div>
      
      {/* Serving size information */}
      <div className="mb-4 text-sm text-gray-600">
        <span className="font-medium">Serving Size:</span> {data.serving_size || '150g (1 katori)'}
      </div>
      
      {data.calculated_by_ai && (
        <div className="mb-4 p-2 bg-amber-50 rounded border border-amber-200">
          <p className="text-sm text-amber-700">Ingredient match rate: {data.ingredient_match_rate}</p>
          <p className="text-xs text-amber-600">AI calculation may not be 100% accurate</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-gray-500">Calories</p>
          <p className="font-medium">{data.calories} kcal</p>
        </div>
        <div className="bg-green-50 p-3 rounded-md">
          <p className="text-sm text-gray-500">Protein</p>
          <p className="font-medium">{data.protein}g</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-md">
          <p className="text-sm text-gray-500">Carbs</p>
          <p className="font-medium">{data.carbs}g</p>
        </div>
        <div className="bg-red-50 p-3 rounded-md">
          <p className="text-sm text-gray-500">Fat</p>
          <p className="font-medium">{data.fat}g</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-md col-span-2">
          <p className="text-sm text-gray-500">Fiber</p>
          <p className="font-medium">{data.fiber}g</p>
        </div>
      </div>
    </div>
  );
};

export default NutritionCard;