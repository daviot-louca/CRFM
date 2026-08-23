import { useEffect, useState } from "react";
import { getCompagnies } from "../api/compagnies.api";

export function useCompagnies() {
  const [compagnies, setCompagnies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const chargerCompagnies = async () => {
      try {
        setLoading(true);
        const data = await getCompagnies();
        console.log("COMPAGNIES :", data);
        setCompagnies(data);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    chargerCompagnies();
  }, []);

  return {
    compagnies,
    loading,
    error,
  };
}
