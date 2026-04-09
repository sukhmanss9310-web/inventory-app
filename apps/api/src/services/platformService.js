import { Company } from "../models/Company.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { createError } from "../utils/errors.js";
import { normalizeCompanyCode } from "../utils/company.js";
import { createActivityLog } from "./activityLogService.js";

const serializeManagedUser = (user) => ({
  id: user._id,
  companyId: user.companyId,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive !== false,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const serializeManagedCompany = (company, users = [], productCount = 0) => {
  const adminCount = users.filter((user) => user.role === "admin").length;
  const staffCount = users.filter((user) => user.role === "staff").length;
  const activeUsers = users.filter((user) => user.isActive !== false).length;

  return {
    id: company._id,
    name: company.name,
    code: company.code,
    isActive: company.isActive !== false,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
    counts: {
      users: users.length,
      activeUsers,
      admins: adminCount,
      staff: staffCount,
      products: productCount
    },
    users: users.map(serializeManagedUser)
  };
};

export const getPlatformOverview = async () => {
  const [companies, users, productCounts] = await Promise.all([
    Company.find({ kind: { $ne: "platform" } }).sort({ createdAt: -1 }).lean(),
    User.find({ role: { $in: ["admin", "staff"] } }).sort({ createdAt: 1 }).lean(),
    Product.aggregate([{ $group: { _id: "$companyId", count: { $sum: 1 } } }])
  ]);

  const productCountsByCompany = new Map(
    productCounts.map((item) => [String(item._id), item.count])
  );
  const usersByCompany = new Map();

  users.forEach((user) => {
    const companyKey = String(user.companyId);
    const companyUsers = usersByCompany.get(companyKey) || [];
    companyUsers.push(user);
    usersByCompany.set(companyKey, companyUsers);
  });

  const managedCompanies = companies.map((company) =>
    serializeManagedCompany(
      company,
      usersByCompany.get(String(company._id)) || [],
      productCountsByCompany.get(String(company._id)) || 0
    )
  );

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.isActive !== false).length;

  return {
    metrics: {
      totalCompanies: managedCompanies.length,
      activeCompanies: managedCompanies.filter((company) => company.isActive).length,
      suspendedCompanies: managedCompanies.filter((company) => !company.isActive).length,
      totalUsers,
      activeUsers
    },
    companies: managedCompanies
  };
};

export const createCompanyWorkspace = async (payload, developer) => {
  const companyName = payload.companyName.trim();
  const companyCode = normalizeCompanyCode(payload.companyCode || companyName);

  if (!companyCode) {
    throw createError("Company code is required", 400);
  }

  const existingCompany = await Company.findOne({ code: companyCode });

  if (existingCompany) {
    throw createError("A company with this code already exists", 409);
  }

  const company = await Company.create({
    name: companyName,
    code: companyCode,
    kind: "client",
    isActive: true
  });

  const admin = await User.create({
    companyId: company._id,
    name: payload.adminName.trim(),
    email: payload.adminEmail.toLowerCase(),
    password: payload.adminPassword,
    role: "admin",
    isActive: true
  });

  await createActivityLog({
    companyId: company._id,
    actorId: developer._id,
    actorName: developer.name,
    actorRole: developer.role,
    action: "user_created",
    entityType: "user",
    entityId: admin._id,
    message: `${developer.name} provisioned ${company.name} and assigned ${admin.name} as admin.`,
    metadata: {
      companyCode: company.code,
      companyName: company.name,
      email: admin.email,
      createdRole: admin.role
    }
  });

  return {
    company: serializeManagedCompany(company, [admin], 0),
    admin: serializeManagedUser(admin)
  };
};

export const updateCompanyAccess = async (companyId, isActive, developer) => {
  const company = await Company.findOne({ _id: companyId, kind: { $ne: "platform" } });

  if (!company) {
    throw createError("Company not found", 404);
  }

  company.isActive = isActive;
  await company.save();

  await createActivityLog({
    companyId: company._id,
    actorId: developer._id,
    actorName: developer.name,
    actorRole: developer.role,
    action: "company_access_updated",
    entityType: "company",
    entityId: company._id,
    message: `${developer.name} ${isActive ? "reactivated" : "suspended"} ${company.name}.`,
    metadata: {
      companyCode: company.code,
      companyName: company.name,
      isActive
    }
  });

  return {
    id: company._id,
    name: company.name,
    code: company.code,
    isActive: company.isActive
  };
};

export const updateUserAccess = async (userId, isActive, developer) => {
  const user = await User.findOne({
    _id: userId,
    role: { $in: ["admin", "staff"] }
  });

  if (!user) {
    throw createError("User not found", 404);
  }

  const company = await Company.findOne({ _id: user.companyId, kind: { $ne: "platform" } }).lean();

  if (!company) {
    throw createError("Company not found", 404);
  }

  user.isActive = isActive;
  await user.save();

  await createActivityLog({
    companyId: company._id,
    actorId: developer._id,
    actorName: developer.name,
    actorRole: developer.role,
    action: "user_access_updated",
    entityType: "user",
    entityId: user._id,
    message: `${developer.name} ${isActive ? "enabled" : "disabled"} ${user.name}'s account.`,
    metadata: {
      companyCode: company.code,
      companyName: company.name,
      email: user.email,
      targetRole: user.role,
      isActive
    }
  });

  return serializeManagedUser(user);
};
