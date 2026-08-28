import {
  addConducteurPleinService,
  getConducteurPleinsService,
  getConducteurVehiculeDetailService,
  getConducteurVehiculesService,
  saveConducteurReleveService,
} from "../services/conducteur.service.js";

const handleError = (res, error) => {
  res.status(error.statusCode || 500).json({
    error: error.message,
  });
};

export const getConducteurVehicules = async (req, res) => {
  try {
    const vehicules = await getConducteurVehiculesService(req.user?.id);
    res.json(vehicules);
  } catch (error) {
    handleError(res, error);
  }
};

export const getConducteurVehiculeDetail = async (req, res) => {
  try {
    const vehicule = await getConducteurVehiculeDetailService(
      req.params.missionVehiculeId,
      req.user?.id,
    );

    res.json(vehicule);
  } catch (error) {
    handleError(res, error);
  }
};

export const saveConducteurReleve = async (req, res) => {
  try {
    const vehicule = await saveConducteurReleveService(
      req.params.missionVehiculeId,
      req.user?.id,
      req.body,
    );

    res.json(vehicule);
  } catch (error) {
    handleError(res, error);
  }
};

export const getConducteurPleins = async (req, res) => {
  try {
    const pleins = await getConducteurPleinsService(
      req.params.missionVehiculeId,
      req.user?.id,
    );

    res.json(pleins);
  } catch (error) {
    handleError(res, error);
  }
};

export const addConducteurPlein = async (req, res) => {
  try {
    const plein = await addConducteurPleinService(
      req.params.missionVehiculeId,
      req.user?.id,
      req.body,
    );

    res.status(201).json(plein);
  } catch (error) {
    handleError(res, error);
  }
};
