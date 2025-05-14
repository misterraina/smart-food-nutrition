// src/hooks/useFoodSuggestions.js
import { useState, useEffect } from 'react';
import { nutritionService } from '../services/api';

/**
 * Custom hook for getting food suggestions
 * @param {string} query - The search query
 * @returns {Object} - The suggestions and loading state
 */
export function useFoodSuggestions(query) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 1) {
        setSuggestions([]);
        return;
      }
      
      setLoading(true);
      try {
        const data = await nutritionService.getFoodSuggestions(query);
        setSuggestions(data);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce the API call
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [query]);
  
  return { suggestions, loading };
}