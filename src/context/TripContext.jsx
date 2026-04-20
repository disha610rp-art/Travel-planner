import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getItem, setItem } from '../services/storageService';

export const TripContext = createContext(null);

const TRIPS_KEY = 'trips';

/**
 * TripProvider — Manages trip data globally with localStorage persistence
 * Each user gets their own trips keyed by user ID
 */
export const TripProvider = ({ userId, children }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const storageKey = useMemo(() => `${TRIPS_KEY}_${userId}`, [userId]);

  // Load trips from localStorage on mount or when userId changes
  useEffect(() => {
    if (userId) {
      const savedTrips = getItem(storageKey, []);
      setTrips(savedTrips);
    } else {
      setTrips([]);
    }
    setLoading(false);
  }, [userId, storageKey]);

  // Persist trips to localStorage whenever they change
  useEffect(() => {
    if (userId && !loading) {
      setItem(storageKey, trips);
    }
  }, [trips, userId, storageKey, loading]);

  const addTrip = useCallback((tripData) => {
    const newTrip = {
      ...tripData,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'planning',
    };
    setTrips((prev) => [newTrip, ...prev]);
    return newTrip;
  }, []);

  const updateTrip = useCallback((tripId, updates) => {
    setTrips((prev) =>
      prev.map((trip) =>
        trip.id === tripId
          ? { ...trip, ...updates, updatedAt: new Date().toISOString() }
          : trip
      )
    );
  }, []);

  const deleteTrip = useCallback((tripId) => {
    setTrips((prev) => prev.filter((trip) => trip.id !== tripId));
  }, []);

  const getTripById = useCallback(
    (tripId) => trips.find((trip) => trip.id === tripId) || null,
    [trips]
  );

  const value = useMemo(() => ({
    trips,
    loading,
    addTrip,
    updateTrip,
    deleteTrip,
    getTripById,
  }), [trips, loading, addTrip, updateTrip, deleteTrip, getTripById]);

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};

export default TripContext;
