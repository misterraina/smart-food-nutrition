// src/components/ServingSizeSelector.js
import React, { useState } from 'react';
import { DEFAULT_SERVING_SIZE } from '../../utils/nutritionUtils';

const ServingSizeSelector = ({ currentSize = DEFAULT_SERVING_SIZE, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const servingSizes = [
    { value: 100, label: '100g (Small)' },
    { value: 150, label: '150g (1 Katori)' },
    { value: 200, label: '200g (Large)' },
    { value: 250, label: '250g (Extra Large)' }
  ];
  
  const handleSelect = (size) => {
    onChange(size);
    setIsOpen(false);
  };
  
  const currentLabel = servingSizes.find(s => s.value === currentSize)?.label || `${currentSize}g`;
  
  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          Serving Size: {currentLabel}
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu">
            {servingSizes.map((size) => (
              <button
                key={size.value}
                className={`block w-full text-left px-4 py-2 text-sm ${currentSize === size.value ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                role="menuitem"
                onClick={() => handleSelect(size.value)}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServingSizeSelector;