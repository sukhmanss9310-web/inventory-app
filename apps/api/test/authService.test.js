import assert from "node:assert/strict";
import test from "node:test";
import { ActivityLog } from "../src/models/ActivityLog.js";
import { User } from "../src/models/User.js";
import { loginUser, registerUser } from "../src/services/authService.js";

const buildSafeUser = (overrides = {}) => {
  const user = {
    _id: "507f1f77bcf86cd799439011",
    name: "Operations Owner",
    email: "owner@ops.local",
    role: "admin",
    createdAt: new Date("2026-04-02T10:00:00.000Z"),
    updatedAt: new Date("2026-04-02T10:00:00.000Z"),
    ...overrides
  };

  return {
    ...user,
    toSafeObject() {
      return {
        id: user._id,
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
  let createdPayload;
  let activityPayload;

  t.mock.method(User, "countDocuments", async () => 0);
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
    name: "Operations Owner",
    email: "owner@ops.local",
    password: "Password@123",
    role: "staff"
  });

  assert.equal(createdPayload.role, "admin");
  assert.equal(result.user.role, "admin");
  assert.equal(typeof result.token, "string");
  assert.equal(activityPayload.action, "user_created");
});

test("registerUser rejects additional user creation for non-admins", async (t) => {
  t.mock.method(User, "countDocuments", async () => 2);
  t.mock.method(User, "findOne", async () => null);

  await assert.rejects(
    registerUser({
      name: "Warehouse Staff",
      email: "staff@ops.local",
      password: "Password@123",
      role: "staff"
    }),
    (error) => {
      assert.equal(error.statusCode, 403);
      assert.match(error.message, /Only an admin can create additional users/);
      return true;
    }
  );
});

test("loginUser rejects invalid passwords", async (t) => {
  t.mock.method(User, "findOne", async () => ({
    comparePassword: async () => false
  }));

  await assert.rejects(
    loginUser({
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

  t.mock.method(User, "findOne", async () => user);

  const result = await loginUser({
    email: "owner@ops.local",
    password: "Password@123"
  });

  assert.equal(result.user.email, "owner@ops.local");
  assert.equal(result.user.role, "admin");
  assert.equal(typeof result.token, "string");
});
