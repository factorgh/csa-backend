import Application from "../models/application.model";
import User from "../models/user.model";
import Audit from "../models/audit.model";
import { paginate } from "../utils/paginate.util";
import { UserStatus } from "../types/types";

export async function listApplications(filter: any, pagination: any) {
  return paginate(Application as any, filter, pagination);
}

export async function getApplicationWithAudit(id: string) {
  const app = await Application.findById(id);
  if (!app)
    throw Object.assign(new Error("Application not found"), { status: 404 });
  const audit = await Audit.find({
    entityType: "Application",
    entityId: id,
  }).sort({ createdAt: -1 });
  return { app, audit };
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  user.status = status;
  await user.save();
  return user;
}

export async function deleteUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  user.status = UserStatus.DELETED;
  await user.save();
  return user;
}

export async function statsOverview() {
  const [total, pending, approved, rejected] = await Promise.all([
    Application.countDocuments({}),
    Application.countDocuments({ status: "PENDING" }),
    Application.countDocuments({ status: "APPROVED" }),
    Application.countDocuments({ status: "REJECTED" }),
  ]);
  return { total, pending, approved, rejected };
}

// Users
export async function listUsers(filter: any, pagination: any) {
  const q: any = {};
  if (filter.role) q.role = filter.role;
  if (filter.status) q.status = filter.status;
  if (filter.email) q.email = new RegExp(filter.email, "i");
  if (filter.name) {
    q.$or = [
      { firstName: new RegExp(filter.name, "i") },
      { lastName: new RegExp(filter.name, "i") },
      { middleName: new RegExp(filter.name, "i") },
    ];
  }
  return paginate(User as any, q, pagination);
}

export async function getUserById(id: string) {
  const user = await User.findById(id);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  return user;
}
