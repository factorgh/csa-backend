import mongoose from "mongoose";
import config from "../config";
import User from "../models/user.model";
import { UserRole, UserStatus } from "../types/runtime";

async function seed() {
  await mongoose.connect(config.mongoUri);
  try {
    // Seed SUPERADMIN using config.admin credentials
    const superEmail = config.admin.email;
    const superPassword = config.admin.password;

    let superAdmin = await User.findOne({ email: superEmail.toLowerCase() });
    if (!superAdmin) {
      superAdmin = await User.create({
        email: superEmail,
        password: superPassword,
        confirmPassword: superPassword,
        firstName: "Super",
        lastName: "Admin",
        role: UserRole.SUPERADMIN,
        status: UserStatus.ACTIVE,
      } as any);
      // eslint-disable-next-line no-console
      console.log(`Created SUPERADMIN: ${superEmail}`);
    } else if (superAdmin.role !== UserRole.SUPERADMIN) {
      superAdmin.role = UserRole.SUPERADMIN as any;
      superAdmin.status = UserStatus.ACTIVE as any;
      await superAdmin.save();
      // eslint-disable-next-line no-console
      console.log(`Updated existing user to SUPERADMIN: ${superEmail}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`SUPERADMIN already exists: ${superEmail}`);
    }

    // Seed an ADMIN account (if not exists)
    const adminEmail = "admin+seed@csa.gov";
    const adminPassword = "Admin@123456";
    let admin = await User.findOne({ email: adminEmail.toLowerCase() });
    console.log("admin", admin);
    if (!admin) {
      admin = await User.create({
        email: adminEmail,
        password: adminPassword,
        confirmPassword: adminPassword,
        firstName: "Seed",
        lastName: "Admin",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      } as any);
      await admin.save();
      // eslint-disable-next-line no-console
      console.log(`Created ADMIN: ${adminEmail}`);
    } else {
      // Ensure proper role/status
      let changed = false;
      if (admin.role !== UserRole.ADMIN) {
        (admin as any).role = UserRole.ADMIN;
        changed = true;
      }
      if (admin.status !== UserStatus.ACTIVE) {
        (admin as any).status = UserStatus.ACTIVE;
        changed = true;
      }
      if (changed) {
        await admin.save();
        // eslint-disable-next-line no-console
        console.log(`Updated existing ADMIN: ${adminEmail}`);
      } else {
        // eslint-disable-next-line no-console
        console.log(`ADMIN already exists: ${adminEmail}`);
      }
    }
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

// admin+seed@csa.gov
// Admin@123456
