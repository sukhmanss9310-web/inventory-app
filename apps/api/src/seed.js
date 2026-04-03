import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { ActivityLog } from "./models/ActivityLog.js";
import { Company } from "./models/Company.js";
import { Dispatch } from "./models/Dispatch.js";
import { Product } from "./models/Product.js";
import { InventoryReturn } from "./models/Return.js";
import { User } from "./models/User.js";

const runSeed = async () => {
  await connectDatabase();

  await Promise.all([
    ActivityLog.deleteMany({}),
    Dispatch.deleteMany({}),
    InventoryReturn.deleteMany({}),
    Product.deleteMany({}),
    User.deleteMany({}),
    Company.deleteMany({})
  ]);

  const company = await Company.create({
    name: env.seedCompanyName,
    code: env.seedCompanyCode
  });

  const admin = await User.create({
    companyId: company._id,
    name: "Operations Owner",
    email: env.seedAdminEmail,
    password: env.seedAdminPassword,
    role: "admin"
  });

  const staff = await User.create({
    companyId: company._id,
    name: "Warehouse Staff",
    email: env.seedStaffEmail,
    password: env.seedStaffPassword,
    role: "staff"
  });

  const products = await Product.insertMany([
    {
      companyId: company._id,
      name: "Boat Rockerz 450",
      sku: "AMZ-BT-450",
      stock: 42,
      lowStockThreshold: 10,
      createdBy: admin._id,
      updatedBy: admin._id
    },
    {
      companyId: company._id,
      name: "Nike Downshifter 13",
      sku: "FLP-NK-013",
      stock: 18,
      lowStockThreshold: 8,
      createdBy: admin._id,
      updatedBy: admin._id
    },
    {
      companyId: company._id,
      name: "Milton Steel Bottle 1L",
      sku: "AMZ-ML-1L",
      stock: 9,
      lowStockThreshold: 10,
      createdBy: admin._id,
      updatedBy: admin._id
    },
    {
      companyId: company._id,
      name: "Samsung 25W Charger",
      sku: "FLP-SM-25W",
      stock: 67,
      lowStockThreshold: 12,
      createdBy: admin._id,
      updatedBy: admin._id
    }
  ]);

  console.log("Seed complete");
  console.log(`Company: ${company.name} (${company.code})`);
  console.log(`Admin login: ${admin.email} / ${env.seedAdminPassword}`);
  console.log(`Staff login: ${staff.email} / ${env.seedStaffPassword}`);
  console.log(`Products seeded: ${products.length}`);
  process.exit(0);
};

runSeed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
