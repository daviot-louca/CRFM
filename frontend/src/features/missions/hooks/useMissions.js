import { useCallback, useEffect, useState } from "react";
import { getMissions } from "../api/missions.api";

export function useMissions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getMissions();
      setMissions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialMissions() {
      try {
        const data = await getMissions();
        if (!isMounted) return;

        setMissions(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitialMissions();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    missions,
    loading,
    error,
    fetchMissions,
  };
}
