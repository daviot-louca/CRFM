import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import routes from "../routes/index.routes.js";

const app = express();

// Sécurité
app.use(helmet());
app.use(hpp());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Compression
app.use(compression());

// Body Parser
app.use(express.json({ limit: "100kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "100kb",
  }),
);

// Cookies
app.use(cookieParser());

// Limitation générale de l'API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Trop de requêtes. Veuillez réessayer plus tard.",
  },
});

app.use("/api", apiLimiter);

// Route de test
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CRFM API is running 🚀",
  });
});

app.use("/api", routes);

export default app;