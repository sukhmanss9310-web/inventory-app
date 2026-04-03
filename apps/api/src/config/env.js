import dotenv from "dotenv";

dotenv.config();

const parsedClientUrls = (
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  "http://localhost:5173,http://localhost:8081,http://localhost:19006"
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const requiredVariables = ["MONGODB_URI", "JWT_SECRET"];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

export const env = {
  port: Number(process.env.PORT || 5001),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: parsedClientUrls[0],
  clientUrls: parsedClientUrls,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  seedCompanyName: process.env.SEED_COMPANY_NAME || "Atlas Retail",
  seedCompanyCode: process.env.SEED_COMPANY_CODE || "atlas-retail",
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL || "owner@ops.local",
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || "Admin@123456",
  seedStaffEmail: process.env.SEED_STAFF_EMAIL || "staff@ops.local",
  seedStaffPassword: process.env.SEED_STAFF_PASSWORD || "Staff@123456"
};
