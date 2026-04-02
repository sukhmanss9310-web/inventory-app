import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authRouter } from "./routes/authRoutes.js";
import { dashboardRouter } from "./routes/dashboardRoutes.js";
import { inventoryRouter } from "./routes/inventoryRoutes.js";
import { logRouter } from "./routes/logRoutes.js";
import { productRouter } from "./routes/productRoutes.js";
import { errorHandler, notFound } from "./middleware/error.js";

export const app = express();
const allowedOrigins = new Set(env.clientUrls);

app.set("trust proxy", env.nodeEnv === "production" ? 1 : 0);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: false
  })
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime()
  });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/logs", logRouter);

app.use(notFound);
app.use(errorHandler);
