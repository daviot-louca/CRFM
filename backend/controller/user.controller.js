import {
  allUsersService,
  allUsersBySectionService,
  allUsersBySectionWithAvailabilityService,
  allUsersByCompagnieService,
  allSoaBySectionService,
  oneUserService,
  addUserService,
  updateUserService,
  deleteUserService,
} from "../services/user.service.js";
export const allUsers = async (req, res) => {
  try {
    const data = await allUsersService();
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    const statusCode = error.statusCode || 500;
    const message =
      statusCode === 500 ? "Erreur interne du serveur." : error.message;

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const allUsersBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const data = await allUsersBySectionService(sectionId);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    const statusCode = error.statusCode || 500;
    const message =
      statusCode === 500 ? "Erreur interne du serveur." : error.message;

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const allUsersBySectionWithAvailability = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { debutMission, finMission } = req.query;

    if (!debutMission || !finMission) {
      return res.status(400).json({
        error: "Les dates debutMission et finMission sont obligatoires.",
      });
    }

    const debut = new Date(debutMission);
    const fin = new Date(finMission);

    if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime())) {
      return res.status(400).json({
        error: "Les dates fournies sont invalides.",
      });
    }

    if (debut > fin) {
      return res.status(400).json({
        error: "La date de début doit être antérieure ou égale à la date de fin.",
      });
    }

    const data = await allUsersBySectionWithAvailabilityService(
      sectionId,
      debutMission,
      finMission,
    );

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    const statusCode = error.statusCode || 500;
    const message =
      statusCode === 500 ? "Erreur interne du serveur." : error.message;

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const allUsersByCompagnie = async (req, res) => {
  try {
    const { compagnieId } = req.params;
    const data = await allUsersByCompagnieService(compagnieId);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    const statusCode = error.statusCode || 500;
    const message =
      statusCode === 500 ? "Erreur interne du serveur." : error.message;

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const allSoaBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const data = await allSoaBySectionService(sectionId);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    const statusCode = error.statusCode || 500;
    const message =
      statusCode === 500 ? "Erreur interne du serveur." : error.message;

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await oneUserService(id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    const statusCode = error.statusCode || 500;
    const message =
      statusCode === 500 ? "Erreur interne du serveur." : error.message;

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const addUser = async (req, res) => {
  try {
    const data = await addUserService(req.body);
    return res.status(201).json(data);
  } catch (error) {
    console.error(error);

    const statusCode = error.statusCode || 500;
    const message =
      statusCode === 500 ? "Erreur interne du serveur." : error.message;

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await updateUserService(id, req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    const statusCode = error.statusCode || 500;
    const message =
      statusCode === 500 ? "Erreur interne du serveur." : error.message;

    return res.status(statusCode).json({
      error: message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    await deleteUserService(id);
    return res.status(200).json({
      message: "Utilisateur supprimé avec succès.",
    });
  } catch (error) {
    console.error(error);

    const statusCode = error.statusCode || 500;
    const message =
      statusCode === 500 ? "Erreur interne du serveur." : error.message;

    return res.status(statusCode).json({
      error: message,
    });
  }
};