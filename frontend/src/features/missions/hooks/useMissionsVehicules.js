import { useMemo, useState } from "react";
import { useMission } from "../context/useMission";

export function useMissionsVehicules(vehicules = []) {
  const { vehiculesSelectionnes, setVehiculesSelectionnes } = useMission();

  const [rechercheVehicule, setRechercheVehicule] = useState("");

  const vehiculesFiltres = useMemo(() => {
    const recherche = rechercheVehicule.toLowerCase().trim();

    if (!recherche) {
      return vehicules;
    }

    return vehicules.filter((vehicule) => {
      const texte = `
        ${vehicule.immatriculation ?? ""}
        ${vehicule?.vehiculeName ?? ""}
        ${vehicule.type ?? ""}
      `.toLowerCase();

      return texte.includes(recherche);
    });
  }, [vehicules, rechercheVehicule]);

  /*
   * ==========================================
   * SÉLECTION D'UN VÉHICULE
   * ==========================================
   *
   * Un véhicule est maintenant associé à :
   *
   * - une compagnie
   * - un groupe
   * - éventuellement un conducteur
   *
   * Un véhicule ne peut être affecté qu'à
   * un seul groupe à la fois.
   */

  const toggleVehicule = (vehiculeId, compagnieId, groupeId) => {
    setVehiculesSelectionnes((precedent) => {
      const liste = Array.isArray(precedent) ? [...precedent] : [];

      const index = liste.findIndex((v) => v.vehiculeId === vehiculeId);

      /*
       * Le véhicule est déjà sélectionné.
       */
      if (index !== -1) {
        /*
         * Il appartient déjà à ce groupe :
         * on le désélectionne.
         */
        if (
          liste[index].compagnieId === compagnieId &&
          liste[index].groupeId === groupeId
        ) {
          liste.splice(index, 1);
        } else {
          /*
           * Le véhicule était affecté à un
           * autre groupe.
           *
           * On déplace donc son affectation
           * vers le nouveau groupe.
           */
          liste[index] = {
            ...liste[index],
            compagnieId,
            groupeId,
          };
        }
      } else {
        /*
         * Nouveau véhicule sélectionné.
         */
        liste.push({
          vehiculeId,
          compagnieId,
          groupeId,
          conducteurId: null,
        });
      }

      return liste;
    });
  };

  /*
   * ==========================================
   * CONDUCTEUR D'UN VÉHICULE
   * ==========================================
   */

  const setConducteurVehicule = (vehiculeId, conducteurId) => {
    setVehiculesSelectionnes((precedent) => {
      const liste = Array.isArray(precedent) ? [...precedent] : [];

      const index = liste.findIndex((v) => v.vehiculeId === vehiculeId);

      if (index === -1) {
        return liste;
      }

      liste[index] = {
        ...liste[index],
        conducteurId: conducteurId || null,
      };

      return liste;
    });
  };

  /*
   * ==========================================
   * VIDER LES VÉHICULES
   * ==========================================
   */

  const viderSelection = () => {
    setVehiculesSelectionnes([]);
  };

  /*
   * ==========================================
   * IDS DES VÉHICULES SÉLECTIONNÉS
   * ==========================================
   */

  const tousVehiculesSelectionnesIds = useMemo(
    () =>
      (Array.isArray(vehiculesSelectionnes) ? vehiculesSelectionnes : []).map(
        (v) => v.vehiculeId,
      ),
    [vehiculesSelectionnes],
  );

  return {
    rechercheVehicule,

    setRechercheVehicule,

    vehicules,

    vehiculesSelectionnes,

    vehiculesFiltres,

    toggleVehicule,

    setConducteurVehicule,

    viderSelection,

    tousVehiculesSelectionnesIds,
  };
}
