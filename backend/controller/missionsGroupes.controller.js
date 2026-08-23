
import * as missionsGroupesService from "../services/missionsGroupes.service.js";

export const getMissionGroupes = async (req, res) => {
  try {
    const { missionId } = req.params;

    const groupes = await missionsGroupesService.getByMission(missionId);

    return res.status(200).json(groupes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const createMissionGroupe = async (req, res) => {
  try {
    const { missionId } = req.params;
    const { nom, ordre, soaId } = req.body;

    const groupe = await missionsGroupesService.create({
      missionId,
      nom,
      ordre,
      soaId: soaId || null,
    });

    return res.status(201).json(groupe);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateMissionGroupe = async (req, res) => {
  try {
    const { id } = req.params;
    const groupe = await missionsGroupesService.update(id, req.body);

    if (!groupe) {
      return res.status(404).json({ error: "Groupe introuvable" });
    }

    return res.status(200).json(groupe);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const deleteMissionGroupe = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await missionsGroupesService.remove(id);

    if (!deleted) {
      return res.status(404).json({ error: "Groupe introuvable" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};