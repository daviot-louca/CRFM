import {
  getAllVehiculeService,
  getAvailableVehiculeService,
  getAllVehiculeTypesService,
  getOneVehiculeService,
  createVehiculeService,
  updateVehiculeService,
  deleteVehiculeService,
} from "../services/vehicule.service.js";

export const getAllVehicule = async (req, res, next) => {
  try {
    const vehicules = await getAllVehiculeService();
    return res.status(200).json(vehicules);
  } catch (error) {
    console.error("GET /vehicules - erreur :", {
      name: error?.name,
      message: error?.message,
      parentMessage: error?.parent?.message,
      detail: error?.parent?.detail,
      code: error?.parent?.code,
      sql: error?.sql,
    });
    return next(error);
  }
};

export const getAvailableVehicule = async (req, res, next) => {
  try {
    const vehicules = await getAvailableVehiculeService();
    return res.status(200).json(vehicules);
  } catch (error) {
    console.error("GET /vehicules/disponibles - erreur :", {
      name: error?.name,
      message: error?.message,
      parentMessage: error?.parent?.message,
      detail: error?.parent?.detail,
      code: error?.parent?.code,
      sql: error?.sql,
    });
    return next(error);
  }
};

export const getAllVehiculeTypes = async (req, res, next) => {
  try {
    const vehiculeTypes = await getAllVehiculeTypesService();
    return res.status(200).json(vehiculeTypes);
  } catch (error) {
    console.error("GET /vehicules/types - erreur :", {
      name: error?.name,
      message: error?.message,
      parentMessage: error?.parent?.message,
      detail: error?.parent?.detail,
      code: error?.parent?.code,
      sql: error?.sql,
    });
    return next(error);
  }
};

export const getOneVehicule = async (req, res, next) => {
  try {
    const vehicule = await getOneVehiculeService(req.params.id);
    return res.status(200).json(vehicule);
  } catch (error) {
    return next(error);
  }
};

export const createVehicule = async (req, res, next) => {
  try {
    const newVehicule = await createVehiculeService(req.body);
    return res.status(201).json(newVehicule);
  } catch (error) {
    return next(error);
  }
};

export const updateVehicule = async (req, res, next) => {
  try {
    const updatedVehicule = await updateVehiculeService(req.params.id, req.body);
    return res.status(200).json(updatedVehicule);
  } catch (error) {
    return next(error);
  }
};

export const deleteVehicule = async (req, res, next) => {
  try {
    await deleteVehiculeService(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};