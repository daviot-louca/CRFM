import { useState } from "react";
import { login } from "../api/auth.service";

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginUser = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const result = await login(data);

      console.log("Connexion réussie :", result);

      return result;
    } catch (error) {
      console.error("Erreur de connexion :", error);

      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loginUser,
    loading,
    error,
  };
};

export default useAuth;