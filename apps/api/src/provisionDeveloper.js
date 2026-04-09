import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { Company } from "./models/Company.js";
import { User } from "./models/User.js";

const run = async () => {
  await connectDatabase();

  let platformCompany = await Company.findOne({
    $or: [{ kind: "platform" }, { code: env.seedPlatformCompanyCode }]
  });

  if (!platformCompany) {
    platformCompany = await Company.create({
      name: env.seedPlatformCompanyName,
      code: env.seedPlatformCompanyCode,
      kind: "platform",
      isActive: true
    });
    console.log(`Created platform company: ${platformCompany.name} (${platformCompany.code})`);
  } else {
    if (platformCompany.kind !== "platform") {
      platformCompany.kind = "platform";
    }

    if (platformCompany.isActive === false) {
      platformCompany.isActive = true;
    }

    await platformCompany.save();
    console.log(`Using existing platform company: ${platformCompany.name} (${platformCompany.code})`);
  }

  const normalizedEmail = env.seedDeveloperEmail.toLowerCase();
  let developer = await User.findOne({
    companyId: platformCompany._id,
    email: normalizedEmail
  });

  if (!developer) {
    developer = await User.create({
      companyId: platformCompany._id,
      name: "Platform Owner",
      email: normalizedEmail,
      password: env.seedDeveloperPassword,
      role: "developer",
      isActive: true
    });
    console.log(`Created developer account: ${developer.email}`);
  } else {
    if (developer.role !== "developer") {
      developer.role = "developer";
    }

    if (developer.isActive === false) {
      developer.isActive = true;
    }

    await developer.save();
    console.log(`Using existing developer account: ${developer.email}`);
  }

  console.log(`Developer login: ${platformCompany.code} • ${developer.email} / ${env.seedDeveloperPassword}`);
  process.exit(0);
};

run().catch((error) => {
  console.error("Developer provisioning failed", error);
  process.exit(1);
});
