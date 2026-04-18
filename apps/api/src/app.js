import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { assistantRouter } from "./routes/assistantRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { dashboardRouter } from "./routes/dashboardRoutes.js";
import { inventoryRouter } from "./routes/inventoryRoutes.js";
import { logRouter } from "./routes/logRoutes.js";
import { platformRouter } from "./routes/platformRoutes.js";
import { productRouter } from "./routes/productRoutes.js";
import { errorHandler, notFound } from "./middleware/error.js";

export const app = express();

// ✅ Trust proxy (needed for Render)
app.set("trust proxy", 1);

// ✅ FIXED CORS (allow everything for now)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ✅ Security + parsing
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Logging
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

// ✅ Rate limiting
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

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime()
  });
});

// ✅ Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/logs", logRouter);
app.use("/api/platform", platformRouter);
app.use("/api/assistant", assistantRouter);

// ✅ Error handling
app.use(notFound);
app.use(errorHandler);
