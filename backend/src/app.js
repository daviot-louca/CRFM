import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import authRoutes from "../routes/auth.routes.js";
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
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Route de test
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CRFM API is running 🚀",
  });
});

app.use("/auth", authRoutes);
app.use("/api", routes);

export default app;
