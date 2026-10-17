import { useState, useEffect, useCallback } from 'react';

// Global in-memory cache surviving route transitions
const apiCache = new Map();

/**
 * Enhanced useApi with Stale-While-Revalidate (SWR) in-memory caching.
 * - If data exists in cache, returns it INSTANTLY (0ms) and avoids showing skeletons.
 * - Quietly validates in background and updates UI smoothly.
 * - Calling refetch() refreshes the data and updates cache.
 */
export const useApi = (apiFunction, initialState = null, options = {}) => {
  // Derive a reliable cache key
  const cacheKey = options.cacheKey || (apiFunction ? (apiFunction.name || apiFunction.toString()) : null);
  const cacheTime = options.cacheTime ?? (5 * 60 * 1000); // 5 minutes default TTL

  const getCachedEntry = () => {
    if (!cacheKey) return null;
    const entry = apiCache.get(cacheKey);
    if (!entry) return null;
    const isFresh = (Date.now() - entry.timestamp) < cacheTime;
    return isFresh ? entry.data : null;
  };

  const initialCachedData = getCachedEntry();
  const hasCachedData = initialCachedData !== null;

  const [data, setInternalData] = useState(hasCachedData ? initialCachedData : initialState);
  const [isLoading, setIsLoading] = useState(!hasCachedData);
  const [error, setError] = useState(null);
  
  // Track refresh triggers
  const [refreshIndex, setRefreshIndex] = useState(0);
  const refetch = useCallback(() => setRefreshIndex(prev => prev + 1), []);

  // Custom setData that also updates cache if key exists
  const setData = useCallback((updater) => {
    setInternalData(prev => {
      const nextData = typeof updater === 'function' ? updater(prev) : updater;
      if (cacheKey) {
        apiCache.set(cacheKey, { data: nextData, timestamp: Date.now() });
      }
      return nextData;
    });
  }, [cacheKey]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      // Only show full loading spinner/skeleton if we don't have any cached data
      const currentCached = getCachedEntry();
      if (currentCached === null) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await apiFunction();
        if (isMounted) {
          setInternalData(response.data);
          if (cacheKey) {
            apiCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
          }
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred.";
        if (isMounted) setError(errorMessage);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [apiFunction, refreshIndex, cacheKey]);

  return { data, setData, isLoading, error, refetch };
};

/**
 * Invalidate all or part of the apiCache.
 * Pass a string (or omit to clear everything) to invalidate matching keys.
 */
export const clearApiCache = (keyPattern) => {
  if (!keyPattern) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(keyPattern)) {
      apiCache.delete(key);
    }
  }
};

