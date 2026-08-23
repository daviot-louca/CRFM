import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT secret is missing");
  }

  return secret;
};

export const generateToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES || "1h",
  });
};

export const verifyJwt = (token) => {
  return jwt.verify(token, getJwtSecret());
};
