const checkRole = (...rolesAutorises) => {
  return (req, res, next) => {
    const role = req.user.role.roleName;

    if (!role) {
      return res.status(401).json({
        error: "Utilisateur non authentifié.",
      });
    }

    if (!rolesAutorises.includes(role)) {
      return res.status(403).json({
        error: "Vous n'avez pas les permissions pour accéder à cette ressource.",
      });
    }

    console.log(`Accès autorisé pour le rôle : ${role}`);
    next();
  };
};

export default checkRole;