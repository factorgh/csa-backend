// User Roles
export enum UserRole {
  APPLICANT = "APPLICANT",
  REVIEWER = "REVIEWER",
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
}

// User Status
export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED",
}

// Application Types
export enum ApplicationType {
  PROVIDER = "PROVIDER",
  PROFESSIONAL = "PROFESSIONAL",
  ESTABLISHMENT = "ESTABLISHMENT",
}

// Application Status
export enum ApplicationStatus {
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// License Status
export enum LicenseStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  REVOKED = "REVOKED",
  SUSPENDED = "SUSPENDED",
}

// Professional Type
export enum ProfessionalType {
  LOCAL = "LOCAL",
  FOREIGN = "FOREIGN",
}

// Dropdown Categories
export enum DropdownCategory {
  SECTOR = "SECTOR",
  EMPLOYEE_SIZE = "EMPLOYEE_SIZE",
  PROFESSIONAL_TYPE = "PROFESSIONAL_TYPE",
  DESIGNATION = "DESIGNATION",
  ID_TYPE = "ID_TYPE",
  SERVICE_TYPE = "SERVICE_TYPE",
}

// Audit Action Types
export enum AuditAction {
  USER_REGISTERED = "USER_REGISTERED",
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  USER_UPDATED = "USER_UPDATED",
  USER_SUSPENDED = "USER_SUSPENDED",
  USER_REACTIVATED = "USER_REACTIVATED",
  USER_DELETED = "USER_DELETED",
  APPLICATION_CREATED = "APPLICATION_CREATED",
  APPLICATION_UPDATED = "APPLICATION_UPDATED",
  APPLICATION_SUBMITTED = "APPLICATION_SUBMITTED",
  APPLICATION_REVIEWED = "APPLICATION_REVIEWED",
  APPLICATION_APPROVED = "APPLICATION_APPROVED",
  APPLICATION_REJECTED = "APPLICATION_REJECTED",
  DOCUMENTS_REQUESTED = "DOCUMENTS_REQUESTED",
  DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED",
  LICENSE_GENERATED = "LICENSE_GENERATED",
  LICENSE_VERIFIED = "LICENSE_VERIFIED",
  LICENSE_STATUS_UPDATED = "LICENSE_STATUS_UPDATED",
  LICENSE_EXPIRED = "LICENSE_EXPIRED",
  LICENSE_RENEWAL_REQUESTED = "LICENSE_RENEWAL_REQUESTED",
  LICENSE_RENEWAL_APPROVED = "LICENSE_RENEWAL_APPROVED",
  LICENSE_RENEWAL_REJECTED = "LICENSE_RENEWAL_REJECTED",
  LICENSE_RENEWED = "LICENSE_RENEWED",
  DROPDOWN_CREATED = "DROPDOWN_CREATED",
  DROPDOWN_UPDATED = "DROPDOWN_UPDATED",
}

// Provider Application Data
export interface IProviderData {
  // Company Information (aligned with providerSchema)
  companyName: string;
  registrationNumber: string;
  tin: string;
  dateIncorporated: Date;
  employeeSize: string;
  companyPhone: string;
  companyMobile?: string;
  companyEmail: string;
  physicalAddress: string;
  postalAddress?: string;
  website?: string;
  companyDescription: string;
  coreBusinessService: string;
  ghanaDigitalPostAddress?: string;
}

// Professional Application Data
export interface IProfessionalData {
  // Core fields (aligned with professionalSchema)
  professionalType: ProfessionalType;
  idType: string;
  idNumber: string;
  country?: string;
  city?: string;
  physicalAddress: string;
  yearsOfExperience?: number;
  qualifications?: string[];
  certifications?: string[];
  institutionName?: string;
  institutionPhoneNumber?: string;
  registeringAs: string;
  otherDetails?: string;
}

// Establishment Application Data
export interface IEstablishmentData {
  // Establishment Information (aligned with establishmentSchema)
  registeringAs: string;
  establishmentName: string;
  sector: string;
  registrationNumber: string;
  tin: string;
  dateEstablished: Date;
  employeeSize: string;
  establishmentPhone: string;
  establishmentEmail: string;
  physicalAddress: string;
  postalAddress?: string;
  ghanaPostAddress?: string;
  website?: string;
  numberOfAccreditedProfessionals?: number;
  description?: string;
  coreBusinessService?: string;
}

// Generic Application Data Union
export type ApplicationData =
  | IProviderData
  | IProfessionalData
  | IEstablishmentData;

// Pagination Result
export interface IPaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API Response
export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// JWT Payload
export interface IJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// File Upload Info
export interface IFileInfo {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
}

export {};
