import { Company } from "../models/Company.js";
import { User } from "../models/User.js";
import { createError } from "../utils/errors.js";
import { normalizeCompanyCode } from "../utils/company.js";
import { signToken } from "../utils/jwt.js";
import { createActivityLog } from "./activityLogService.js";

const serializeUser = (user, company = null) =>
  typeof user.toSafeObject === "function"
    ? user.toSafeObject(company)
    : {
        id: user._id,
        companyId: company?._id || user.companyId,
        companyName: company?.name,
        companyCode: company?.code,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

const createCompanyForSignup = async (payload) => {
  const companyName = payload.companyName?.trim();
  const companyCode = normalizeCompanyCode(payload.companyCode || payload.companyName || "");

  if (!companyName) {
    throw createError("Company name is required", 400);
  }

  if (!companyCode) {
    throw createError("Company code is required", 400);
  }

  const existingCompany = await Company.findOne({ code: companyCode });

  if (existingCompany) {
    throw createError("A company with this code already exists", 409);
  }

  return Company.create({
    name: companyName,
    code: companyCode
  });
};

export const registerUser = async (payload, currentUser = null, currentCompany = null) => {
  const normalizedEmail = payload.email.toLowerCase();
  let role = payload.role || "staff";
  let company = currentCompany;
  let message = "";

  if (!currentUser) {
    company = await createCompanyForSignup(payload);
    role = "admin";
  } else if (currentUser.role !== "admin") {
    throw createError("Only an admin can create additional users", 403);
  }

  const existingUser = await User.findOne({
    companyId: company._id,
    email: normalizedEmail
  });

  if (existingUser) {
    throw createError("A user with this email already exists in this company", 409);
  }

  const user = await User.create({
    companyId: company._id,
    name: payload.name,
    email: normalizedEmail,
    password: payload.password,
    role
  });

  message = currentUser
    ? `${currentUser.name} created ${user.name} as ${user.role} in ${company.name}.`
    : `${user.name} created ${company.name} and became its admin.`;

  await createActivityLog({
    companyId: company._id,
    actorId: currentUser?._id || user._id,
    actorName: currentUser?.name || user.name,
    actorRole: currentUser?.role || user.role,
    action: "user_created",
    entityType: "user",
    entityId: user._id,
    message,
    metadata: {
      companyCode: company.code,
      companyName: company.name,
      email: user.email,
      createdRole: user.role
    }
  });

  return {
    company: {
      id: company._id,
      name: company.name,
      code: company.code
    },
    user: serializeUser(user, company),
    token: currentUser ? null : signToken({ userId: user._id, companyId: company._id })
  };
};

export const loginUser = async ({ companyCode, email, password }) => {
  const normalizedCompanyCode = normalizeCompanyCode(companyCode);
  const company = await Company.findOne({ code: normalizedCompanyCode });

  if (!company) {
    throw createError("Company not found", 404);
  }

  const user = await User.findOne({
    companyId: company._id,
    email: email.toLowerCase()
  });

  if (!user) {
    throw createError("Invalid email or password", 401);
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    throw createError("Invalid email or password", 401);
  }

  return {
    company: {
      id: company._id,
      name: company.name,
      code: company.code
    },
    token: signToken({ userId: user._id, companyId: company._id }),
    user: serializeUser(user, company)
  };
};
