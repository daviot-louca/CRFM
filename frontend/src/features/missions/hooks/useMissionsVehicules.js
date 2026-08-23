import { useMemo, useState } from "react";
import { useMission } from "../context/useMission";

export function useMissionsVehicules(vehicules = []) {
  const {
    vehiculesSelectionnes,
    setVehiculesSelectionnes,
  } = useMission();

  const [rechercheVehicule, setRechercheVehicule] = useState("");

  const vehiculesFiltres = useMemo(() => {
    const recherche = rechercheVehicule.toLowerCase().trim();

    if (!recherche) return vehicules;

    return vehicules.filter((vehicule) => {
      const texte = `${vehicule.immatriculation ?? ""} ${vehicule?.vehiculeName ?? ""} ${vehicule.type ?? ""}`.toLowerCase();
      return texte.includes(recherche);
    });
  }, [vehicules, rechercheVehicule]);

  const toggleVehicule = (vehiculeId, compagnieId) => {
    setVehiculesSelectionnes((precedent) => {
      const liste = Array.isArray(precedent)
        ? [...precedent]
        : [...precedent];

      const index = liste.findIndex(
        (v) => v.vehiculeId === vehiculeId
      );

      if (index !== -1) {
        if (liste[index].compagnieId === compagnieId) {
          liste.splice(index, 1);
        } else {
          liste[index] = {
            ...liste[index],
            compagnieId,
          };
        }
      } else {
        liste.push({ vehiculeId, compagnieId });
      }

      return liste;
    });
  };

  const viderSelection = () => {
    setVehiculesSelectionnes([]);
  };

  const tousVehiculesSelectionnesIds = useMemo(
    () => (Array.isArray(vehiculesSelectionnes)
      ? vehiculesSelectionnes.map((v) => v.vehiculeId)
      : [...vehiculesSelectionnes].map((v) => v.vehiculeId)),
    [vehiculesSelectionnes]
  );

  return {

    rechercheVehicule,
  
    setRechercheVehicule,
  
    vehicules, // <-- à ajouter
  
    vehiculesSelectionnes,
  
    vehiculesFiltres,
  
    toggleVehicule,
  
    viderSelection,
  
    tousVehiculesSelectionnesIds,
  
  };
}
