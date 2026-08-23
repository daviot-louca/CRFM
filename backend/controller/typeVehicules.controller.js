import {
  getTypeVehiculesService,
  getTypeVehiculeByIdService,
  createTypeVehiculeService,
  updateTypeVehiculeService,
  deleteTypeVehiculeService,
} from '../services/typeVehicules.service.js';

export const getTypeVehicules = async (req, res) => {
  try {
    const typeVehicules = await getTypeVehiculesService();
    return res.status(200).json(typeVehicules);
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error:
        statusCode === 500
          ? 'Erreur interne du serveur.'
          : error.message,
    });
  }
};

export const getTypeVehiculeById = async (req, res) => {
  try {
    const typeVehicule = await getTypeVehiculeByIdService(req.params.id);
    return res.status(200).json(typeVehicule);
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error:
        statusCode === 500
          ? 'Erreur interne du serveur.'
          : error.message,
    });
  }
};

export const createTypeVehicule = async (req, res) => {
  try {
    const newTypeVehicule = await createTypeVehiculeService(req.body);
    return res.status(201).json(newTypeVehicule);
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error:
        statusCode === 500
          ? 'Erreur interne du serveur.'
          : error.message,
    });
  }
};

export const updateTypeVehicule = async (req, res) => {
  try {
    const updatedTypeVehicule = await updateTypeVehiculeService(req.params.id, req.body);
    return res.status(200).json(updatedTypeVehicule);
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error:
        statusCode === 500
          ? 'Erreur interne du serveur.'
          : error.message,
    });
  }
};

export const deleteTypeVehicule = async (req, res) => {
  try {
    await deleteTypeVehiculeService(req.params.id);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error:
        statusCode === 500
          ? 'Erreur interne du serveur.'
          : error.message,
    });
  }
};