import { useState, useCallback } from 'react';
import * as groqService from '../services/groqService';

/**
 * useGroqAI — Hook managing loading/error/data states for Groq AI service calls
 * Uses useCallback for memoized API call functions
 */
const useGroqAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callAPI = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateItinerary = useCallback(
    (params) => callAPI(groqService.generateItinerary, params),
    [callAPI]
  );

  const suggestHotels = useCallback(
    (destination, budget, nights) => callAPI(groqService.suggestHotels, destination, budget, nights),
    [callAPI]
  );

  const suggestRestaurants = useCallback(
    (destination, budget, preferences) => callAPI(groqService.suggestRestaurants, destination, budget, preferences),
    [callAPI]
  );

  const suggestPlaces = useCallback(
    (destination, days, preferences) => callAPI(groqService.suggestPlaces, destination, days, preferences),
    [callAPI]
  );

  const generateExpenseBreakdown = useCallback(
    (itinerary, budget, travelers) => callAPI(groqService.generateExpenseBreakdown, itinerary, budget, travelers),
    [callAPI]
  );

  const generateFullTrip = useCallback(
    (params) => callAPI(groqService.generateFullTrip, params),
    [callAPI]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    clearError,
    generateItinerary,
    suggestHotels,
    suggestRestaurants,
    suggestPlaces,
    generateExpenseBreakdown,
    generateFullTrip,
  };
};

export default useGroqAI;
