import {getCarburantService,getCarburantByIdService} from "../services/carburant.service.js";

export const getAllCartesCarburant = async (req, res) => {
  try {
    const cartesCarburant = await getCarburantService();
    res.status(200).json(cartesCarburant);
  } catch (error) {
    console.error("Erreur lors de la récupération des cartes carburant :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des cartes carburant" });
  }
};

export const getCarteCarburantById = async (req, res) => {
  const { id } = req.params;
  try {
    const carteCarburant = await getCarburantByIdService(id);
    if (!carteCarburant) {
      return res.status(404).json({ message: "Carte carburant non trouvée" });
    }
    res.status(200).json(carteCarburant);
  } catch (error) {
    console.error(`Erreur lors de la récupération de la carte carburant avec l'ID ${id} :`, error);
    res.status(500).json({ message: "Erreur lors de la récupération de la carte carburant" });
  }
}; 