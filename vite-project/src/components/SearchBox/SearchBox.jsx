// src/components/SearchBox/SearchBox.js 
import React, { useState, useRef, useEffect } from 'react'; 
import { useFoodSuggestions } from '../../hooks/useFoodSuggestions';

const SearchBox = ({ onSearch }) => {
  const [dishName, setDishName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);
  
  // Use the custom hook for suggestions
  const { suggestions, loading } = useFoodSuggestions(dishName);
  
  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);
  
  const handleSearch = () => {
    if (dishName.trim()) {
      onSearch(dishName);
      setShowSuggestions(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    setDishName(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };
  
  return (
    <div className="w-full max-w-md" ref={wrapperRef}>
      <div className="flex items-center justify-center">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Enter dish name (e.g., Paneer Butter Masala)"
            value={dishName}
            onChange={(e) => {
              setDishName(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            className="w-full p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {loading && (
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion.food_name)}
                >
                  {suggestion.food_name}
                </div>
              ))}
            </div>
          )}
          {showSuggestions && dishName.trim().length > 0 && suggestions.length === 0 && !loading && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg">
              <div className="px-4 py-2 text-gray-500">
                No matches found. Click search to try AI calculation.
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 min-h-[42px]"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchBox;