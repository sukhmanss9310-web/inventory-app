import assert from "node:assert/strict";
import test from "node:test";
import { ActivityLog } from "../src/models/ActivityLog.js";
import { Company } from "../src/models/Company.js";
import { User } from "../src/models/User.js";
import { loginUser, registerUser } from "../src/services/authService.js";

const company = {
  _id: "507f1f77bcf86cd799439001",
  name: "Atlas Retail",
  code: "atlas-retail"
};

const buildSafeUser = (overrides = {}) => {
  const user = {
    _id: "507f1f77bcf86cd799439011",
    companyId: company._id,
    name: "Operations Owner",
    email: "owner@ops.local",
    role: "admin",
    createdAt: new Date("2026-04-02T10:00:00.000Z"),
    updatedAt: new Date("2026-04-02T10:00:00.000Z"),
    ...overrides
  };

  return {
    ...user,
    toSafeObject(selectedCompany = null) {
      return {
        id: user._id,
        companyId: selectedCompany?._id || user.companyId,
        companyName: selectedCompany?.name,
        companyCode: selectedCompany?.code,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    }
  };
};

test("registerUser bootstraps the first user as admin", async (t) => {
  const createdUser = buildSafeUser();
  let createdCompanyPayload;
  let createdPayload;
  let activityPayload;

  t.mock.method(Company, "findOne", async () => null);
  t.mock.method(Company, "create", async (payload) => {
    createdCompanyPayload = payload;
    return company;
  });
  t.mock.method(User, "findOne", async () => null);
  t.mock.method(User, "create", async (payload) => {
    createdPayload = payload;
    return createdUser;
  });
  t.mock.method(ActivityLog, "create", async (payload) => {
    activityPayload = payload;
    return payload;
  });

  const result = await registerUser({
    companyName: "Atlas Retail",
    companyCode: "Atlas Retail",
    name: "Operations Owner",
    email: "owner@ops.local",
    password: "Password@123",
    role: "staff"
  });

  assert.equal(createdCompanyPayload.name, "Atlas Retail");
  assert.equal(createdCompanyPayload.code, "atlas-retail");
  assert.equal(createdPayload.companyId, company._id);
  assert.equal(createdPayload.role, "admin");
  assert.equal(result.user.role, "admin");
  assert.equal(result.user.companyCode, company.code);
  assert.equal(typeof result.token, "string");
  assert.equal(activityPayload.action, "user_created");
  assert.equal(activityPayload.companyId, company._id);
});

test("registerUser rejects additional user creation for non-admins", async (t) => {
  await assert.rejects(
    registerUser(
      {
        name: "Warehouse Staff",
        email: "staff@ops.local",
        password: "Password@123",
        role: "staff"
      },
      { _id: "507f1f77bcf86cd799439099", name: "Staff User", role: "staff" },
      company
    ),
    (error) => {
      assert.equal(error.statusCode, 403);
      assert.match(error.message, /Only an admin can create additional users/);
      return true;
    }
  );
});

test("loginUser rejects invalid passwords", async (t) => {
  t.mock.method(Company, "findOne", async () => company);
  t.mock.method(User, "findOne", async () => ({
    comparePassword: async () => false
  }));

  await assert.rejects(
    loginUser({
      companyCode: "atlas-retail",
      email: "owner@ops.local",
      password: "wrong-password"
    }),
    (error) => {
      assert.equal(error.statusCode, 401);
      assert.match(error.message, /Invalid email or password/);
      return true;
    }
  );
});

test("loginUser returns token and safe user payload for valid credentials", async (t) => {
  const user = buildSafeUser({
    comparePassword: async () => true
  });

  t.mock.method(Company, "findOne", async () => company);
  t.mock.method(User, "findOne", async () => user);

  const result = await loginUser({
    companyCode: "atlas-retail",
    email: "owner@ops.local",
    password: "Password@123"
  });

  assert.equal(result.user.email, "owner@ops.local");
  assert.equal(result.user.role, "admin");
  assert.equal(result.user.companyName, company.name);
  assert.equal(typeof result.token, "string");
});
