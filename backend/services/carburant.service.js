import CarteCarburant from "../models/cartesCarburant.model.js";

export const getCarburantService = async () => {
    return await CarteCarburant.findAll({
      attributes: ["id", "type", "numero"],
    });
  };

  export const getCarburantByIdService = async (id) => {
    return await CarteCarburant.findByPk(id, {
      attributes: ["code"],
    });
  };