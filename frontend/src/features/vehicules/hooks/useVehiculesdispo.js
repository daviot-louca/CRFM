import { useEffect, useState } from "react";
import { getVehiculesDisponibles } from "../api/vehicules.api";

export function useVehicules() {
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicules = async () => {
      try {
        const data = await getVehiculesDisponibles();
        setVehicules(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicules();
  }, []);

  return {
    vehicules,
    loading,
    error,
  };
}