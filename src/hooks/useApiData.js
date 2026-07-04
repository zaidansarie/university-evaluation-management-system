import { useState, useCallback, useEffect } from 'react';
import { fetchWithHandling } from '../utils/api';
import { useBackendStatus } from '../contexts/BackendStatusContext';
import { useToast } from '../contexts/ToastContext';

export function useApiData(endpoint, initialData = [], dependencies = []) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { reportOffline, reportOnline } = useBackendStatus();
  const { showToast } = useToast();

  const fetchData = useCallback(async (isRetry = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWithHandling(`http://localhost:5000${endpoint}`);
      setData(result);
      reportOnline();
      if (isRetry) {
        showToast('✓ Connected successfully.');
      }
    } catch (err) {
      if (err.type === 'NETWORK') {
        reportOffline();
      }
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, reportOffline, reportOnline, showToast]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch: fetchData, setData };
}
