import { useContext } from 'react';
import { TripContext } from '../context/TripContext';

/**
 * useTrips — Convenience hook to access TripContext
 * @returns {{ trips, loading, addTrip, updateTrip, deleteTrip, getTripById }}
 */
const useTrips = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
};

export default useTrips;
