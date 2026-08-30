import User from "../models/user.model.js";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";

export const loginService = async ({ phoneNumber, password }) => {
  try {
    const user = await User.findOne({
      where: { phoneNumber },
      include: ["role"],
    });

    if (!user) {
      throw new Error("Utilisateur incorrect");
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      throw new Error("Identifiants incorrects");
    }

    const token = jwt.sign(
      {
        id: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      },
    );
    const userData = user.toJSON();
    delete userData.password;
    return {
      token,
      user: userData,
    };
  } catch (error) {
    console.error("Erreur lors de la connexion", error);
    throw error;
  }
};
export const modifierMotDePasseService = async ({
  oldPassword,
  newPassword,
  id,
}) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error("utilisateur incorrect");
  }
  const result = await compare(oldPassword, user.password);
  if (!result) {
    throw new Error("ancien mot de passe incorrect");
  } else {
    const newPasswordcrypt = await hash(newPassword, 10);
    user.password = newPasswordcrypt;
    await user.save();
    return user;
  }
};
