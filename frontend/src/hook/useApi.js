import { useState, useEffect } from 'react';

export const useApi = (apiFunction, initialState = null) => {
  const [data, setData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Track refresh triggers
  const [refreshIndex, setRefreshIndex] = useState(0);
  const refetch = () => setRefreshIndex(prev => prev + 1);

  useEffect(() => {
    let isMounted = true; 

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFunction();
        if (isMounted) setData(response.data);
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
  }, [apiFunction, refreshIndex]);

  return { data, setData, isLoading, error, refetch };
};
