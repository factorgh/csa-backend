import crypto from "crypto";
import config from "../config";
import { ApplicationType } from "../types/types";

export function generateLicenseNumber(type: ApplicationType): string {
  const year = new Date().getFullYear();
  const typeCode =
    type === ApplicationType.PROVIDER
      ? "PRV"
      : type === ApplicationType.PROFESSIONAL
      ? "PRO"
      : "EST";
  const random = crypto.randomInt(100000, 999999); // 6-digit random
  const base = `${config.license.prefix}-${year}-${typeCode}-${random}`;
  // simple checksum: last 2 hex of sha1
  const checksum = crypto
    .createHash("sha1")
    .update(base)
    .digest("hex")
    .slice(0, 2)
    .toUpperCase();
  return `${base}-${checksum}`;
}

export function generateVerificationHash(licenseNumber: string): string {
  return crypto.createHash("sha256").update(licenseNumber).digest("hex");
}
