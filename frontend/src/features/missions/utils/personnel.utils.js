

export const filtrerPersonnel = (users = [], recherche = "") => {
  const valeur = recherche.trim().toLowerCase();

  if (!valeur) return users;

  return users.filter((user) => {
    const texte = `${user.grade ?? ""} ${user.lastName ?? user.nom ?? ""} ${user.email ?? ""}`
      .toLowerCase()
      .trim();

    return texte.includes(valeur);
  });
};

export const getNomComplet = (user) => {
  if (!user) return "";

  return `${user.grade ?? ""} ${user.lastName ?? user.nom ?? user.email ?? ""}`.trim();
};

export const tousSelectionnes = (users = [], selection = new Set()) => {
  if (!users.length) return false;

  return users.every((user) => selection.has(user.id));
};

export const getTousUsersSelectionnesIds = (usersSelectionnes = {}) => {
  return Object.values(usersSelectionnes).flatMap((selection) => [...selection]);
};
