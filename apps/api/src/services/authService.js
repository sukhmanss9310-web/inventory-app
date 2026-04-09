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
        isActive: user.isActive !== false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

export const registerUser = async (payload, currentUser = null, currentCompany = null) => {
  const normalizedEmail = payload.email.toLowerCase();

  if (!currentUser) {
    throw createError("Public signup is disabled. Contact the platform owner for access.", 403);
  }

  if (currentUser.role !== "admin") {
    throw createError("Only an admin can create additional users", 403);
  }

  const company = currentCompany;
  const role = payload.role || "staff";

  if (company?.isActive === false) {
    throw createError("This company is suspended. Contact the platform owner.", 403);
  }

  if (currentUser.isActive === false) {
    throw createError("Your account is disabled. Contact the platform owner.", 403);
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

  await createActivityLog({
    companyId: company._id,
    actorId: currentUser._id,
    actorName: currentUser.name,
    actorRole: currentUser.role,
    action: "user_created",
    entityType: "user",
    entityId: user._id,
    message: `${currentUser.name} created ${user.name} as ${user.role} in ${company.name}.`,
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
    token: null
  };
};

export const loginUser = async ({ companyCode, email, password }) => {
  const normalizedCompanyCode = normalizeCompanyCode(companyCode);
  const company = await Company.findOne({ code: normalizedCompanyCode });

  if (!company) {
    throw createError("Company not found", 404);
  }

  if (company.isActive === false) {
    throw createError("This company workspace has been suspended by the platform owner.", 403);
  }

  const user = await User.findOne({
    companyId: company._id,
    email: email.toLowerCase()
  });

  if (!user) {
    throw createError("Invalid email or password", 401);
  }

  if (user.isActive === false) {
    throw createError("Your account has been disabled by the platform owner.", 403);
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
