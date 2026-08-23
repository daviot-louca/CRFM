import { loginService } from "../services/auth.service.js";

export const loginController = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: "L'email et le mot de passe sont obligatoires.",
    });
  }
  try {
    const result = await loginService({ email, password });
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;
    const message =
      statusCode === 500 ? "Erreur interne du serveur" : error.message;
    return res.status(statusCode).json({ error: message });
  }
};
