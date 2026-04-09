import assert from "node:assert/strict";
import test from "node:test";
import { Company } from "../src/models/Company.js";
import { Product } from "../src/models/Product.js";
import { User } from "../src/models/User.js";
import {
  createCompanyWorkspace,
  getPlatformOverview,
  updateCompanyAccess,
  updateUserAccess
} from "../src/services/platformService.js";
import { ActivityLog } from "../src/models/ActivityLog.js";

const developer = {
  _id: "507f1f77bcf86cd799439900",
  name: "Platform Owner",
  role: "developer",
  companyId: "507f1f77bcf86cd799439901"
};

test("createCompanyWorkspace provisions a client company and admin user", async (t) => {
  let createdCompanyPayload;
  let createdUserPayload;
  let activityPayload;

  t.mock.method(Company, "findOne", async () => null);
  t.mock.method(Company, "create", async (payload) => {
    createdCompanyPayload = payload;
    return {
      _id: "507f1f77bcf86cd799439001",
      createdAt: new Date("2026-04-03T08:00:00.000Z"),
      updatedAt: new Date("2026-04-03T08:00:00.000Z"),
      ...payload
    };
  });
  t.mock.method(User, "create", async (payload) => {
    createdUserPayload = payload;
    return {
      _id: "507f1f77bcf86cd799439011",
      createdAt: new Date("2026-04-03T08:05:00.000Z"),
      updatedAt: new Date("2026-04-03T08:05:00.000Z"),
      isActive: true,
      ...payload
    };
  });
  t.mock.method(ActivityLog, "create", async (payload) => {
    activityPayload = payload;
    return payload;
  });

  const result = await createCompanyWorkspace(
    {
      companyName: "Northstar Commerce",
      companyCode: "Northstar Commerce",
      adminName: "Nihar",
      adminEmail: "nihar@example.com",
      adminPassword: "Password@123"
    },
    developer
  );

  assert.equal(createdCompanyPayload.kind, "client");
  assert.equal(createdCompanyPayload.code, "northstar-commerce");
  assert.equal(createdUserPayload.role, "admin");
  assert.equal(createdUserPayload.email, "nihar@example.com");
  assert.equal(result.company.code, "northstar-commerce");
  assert.equal(result.admin.role, "admin");
  assert.equal(activityPayload.action, "user_created");
});

test("getPlatformOverview returns client companies with counts and users", async (t) => {
  t.mock.method(Company, "find", () => ({
    sort() {
      return this;
    },
    lean: async () => [
      {
        _id: "507f1f77bcf86cd799439001",
        name: "Atlas Retail",
        code: "atlas-retail",
        isActive: true,
        createdAt: new Date("2026-04-03T08:00:00.000Z"),
        updatedAt: new Date("2026-04-03T08:00:00.000Z")
      },
      {
        _id: "507f1f77bcf86cd799439002",
        name: "Northstar Commerce",
        code: "northstar",
        isActive: false,
        createdAt: new Date("2026-04-03T08:00:00.000Z"),
        updatedAt: new Date("2026-04-03T08:00:00.000Z")
      }
    ]
  }));
  t.mock.method(User, "find", () => ({
    sort() {
      return this;
    },
    lean: async () => [
      {
        _id: "u1",
        companyId: "507f1f77bcf86cd799439001",
        name: "Atlas Admin",
        email: "atlas-admin@example.com",
        role: "admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: "u2",
        companyId: "507f1f77bcf86cd799439001",
        name: "Atlas Staff",
        email: "atlas-staff@example.com",
        role: "staff",
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }));
  t.mock.method(Product, "aggregate", async () => [
    { _id: "507f1f77bcf86cd799439001", count: 4 }
  ]);

  const overview = await getPlatformOverview();

  assert.equal(overview.metrics.totalCompanies, 2);
  assert.equal(overview.metrics.activeCompanies, 1);
  assert.equal(overview.metrics.suspendedCompanies, 1);
  assert.equal(overview.metrics.totalUsers, 2);
  assert.equal(overview.companies[0].counts.products, 4);
  assert.equal(overview.companies[0].counts.activeUsers, 1);
});

test("updateCompanyAccess and updateUserAccess toggle access with audit logs", async (t) => {
  let companySaveCount = 0;
  let userSaveCount = 0;
  const activityPayloads = [];

  t.mock.method(Company, "findOne", (filter) => {
    if (filter._id === "507f1f77bcf86cd799439001") {
      const companyRecord = {
        _id: filter._id,
        name: "Atlas Retail",
        code: "atlas-retail",
        isActive: true,
        async save() {
          companySaveCount += 1;
        },
        async lean() {
          return {
            _id: filter._id,
            name: "Atlas Retail",
            code: "atlas-retail"
          };
        }
      };

      return companyRecord;
    }

    return {
      _id: "507f1f77bcf86cd799439001",
      name: "Atlas Retail",
      code: "atlas-retail",
      async lean() {
        return {
          _id: "507f1f77bcf86cd799439001",
          name: "Atlas Retail",
          code: "atlas-retail"
        };
      }
    };
  });
  t.mock.method(User, "findOne", async () => ({
    _id: "507f1f77bcf86cd799439011",
    companyId: "507f1f77bcf86cd799439001",
    name: "Atlas Admin",
    email: "atlas-admin@example.com",
    role: "admin",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    async save() {
      userSaveCount += 1;
    }
  }));
  t.mock.method(ActivityLog, "create", async (payload) => {
    activityPayloads.push(payload);
    return payload;
  });

  const companyResult = await updateCompanyAccess(
    "507f1f77bcf86cd799439001",
    false,
    developer
  );
  const userResult = await updateUserAccess("507f1f77bcf86cd799439011", false, developer);

  assert.equal(companySaveCount, 1);
  assert.equal(userSaveCount, 1);
  assert.equal(companyResult.isActive, false);
  assert.equal(userResult.isActive, false);
  assert.deepEqual(
    activityPayloads.map((item) => item.action),
    ["company_access_updated", "user_access_updated"]
  );
});
