import {
  getAllSectionsByCompagnieService,
  getSectionByIdService,
  createSectionService,
  updateSectionService,
  deleteSectionService,
  getSectionMeService,
} from "../services/section.service.js";

export const getAllSectionsByCompagnie = async (req, res) => {
  try {
    const { compagnieId } = req.params;
    const sections = await getAllSectionsByCompagnieService(compagnieId);
    return res.status(200).json(sections);
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error: statusCode === 500 ? "Erreur interne du serveur." : error.message,
    });
  }
};
export const getSectionById = async (req, res) => {
  try {
    const id = req.params.id;
    const section = await getSectionByIdService(id);
    return res.status(200).json(section);
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error: statusCode === 500 ? "Erreur interne du serveur." : error.message,
    });
  }
};

export const createSection = async (req, res) => {
  try {
    const sectionData = req.body;
    const newSection = await createSectionService(sectionData);
    return res.status(201).json(newSection);
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error: statusCode === 500 ? "Erreur interne du serveur." : error.message,
    });
  }
};

export const updateSection = async (req, res) => {
  try {
    const id = req.params.id;
    const sectionData = req.body;
    const updatedSection = await updateSectionService(id, sectionData);
    return res.status(200).json(updatedSection);
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error: statusCode === 500 ? "Erreur interne du serveur." : error.message,
    });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const id = req.params.id;
    await deleteSectionService(id);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error: statusCode === 500 ? "Erreur interne du serveur." : error.message,
    });
  }
};

export const getSectionMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const section = await getSectionMeService(userId);
    return res.status(200).json(section);
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error: statusCode === 500 ? "Erreur interne du serveur." : error.message,
    });
  }
};
