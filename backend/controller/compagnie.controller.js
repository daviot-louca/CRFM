import {
  getAllCompagniesService,
  getCompagnieByIdService,
  createCompagnieService,
  updateCompagnieService,
  deleteCompagnieService,
  getMyCompagnieService,
} from "../services/compagnie.service.js";

export const getAllCompagnies = async (req, res) => {
  try {
    const compagnies = await getAllCompagniesService();
    return res.status(200).json(compagnies);
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error: statusCode === 500 ? "Erreur interne du serveur." : error.message,
    });
  }
};

export const getCompagnieById = async (req, res) => {
  try {
    const id = req.params.id;
    const compagnie = await getCompagnieByIdService(id);
    return res.status(200).json(compagnie);
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error: statusCode === 500 ? "Erreur interne du serveur." : error.message,
    });
  }
};

export const createCompagnie = async (req, res) => {
  try {
    const compagnieData = req.body;
    const newCompagnie = await createCompagnieService(compagnieData);
    return res.status(201).json(newCompagnie);
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error: statusCode === 500 ? "Erreur interne du serveur." : error.message,
    });
  }
};

export const updateCompagnie = async (req, res) => {
  try {
    const id = req.params.id;
    const compagnieData = req.body;
    const updatedCompagnie = await updateCompagnieService(id, compagnieData);
    return res.status(200).json(updatedCompagnie);
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error: statusCode === 500 ? "Erreur interne du serveur." : error.message,
    });
  }
};

export const deleteCompagnie = async (req, res) => {
  try {
    const id = req.params.id;
    await deleteCompagnieService(id);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error: statusCode === 500 ? "Erreur interne du serveur." : error.message,
    });
  }
};

export const getMyCompagnie = async (req, res) => {
  try {
    const userId = req.user.id;
    const compagnie = await getMyCompagnieService(userId);
    return res.status(200).json(compagnie);
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error: statusCode === 500 ? "Erreur interne du serveur." : error.message,
    });
  }
};
