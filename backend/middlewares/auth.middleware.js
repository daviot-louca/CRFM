import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Token manquant.",
    });
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({
      error: "Format du token invalide.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      error: "Token invalide ou expiré.",
    });
  }
};

export default authJwt;