import { z } from 'zod';

export const accountInfoSchema = z.object({
  firstname: z.string().min(1),
  middleName: z.string().optional(),
  lastname: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(6),
  telephoneNumber: z.string().optional(),
  gender: z.enum(["Male","Female","Other"]).optional(),
  designation: z.string().optional()
});

export const providerSchema = z.object({
  account: accountInfoSchema,
  registration: z.object({
    nameOfInstitution: z.string(),
    businessRegistrationNumber: z.string(),
    tin: z.string(),
    dateIncorporated: z.string(), // ISO date
    employeeSize: z.string(),
    emailAddress: z.string().email(),
    website: z.string().optional(),
    mobileNumber: z.string(),
    physicalAddress: z.string(),
    postalAddress: z.string().optional(),
    ghanaPostAddress: z.string(),
    coreBusinessService: z.string(),
    description: z.string().optional()
  })
});

export const professionalSchema = z.object({
  account: accountInfoSchema,
  professional: z.object({
    professionalType: z.enum(["Local","Foreign"]),
    designation: z.string(),
    nationalIdType: z.enum(["Ghana Card","Passport"]),
    idNumber: z.string(),
    country: z.string().optional(),
    city: z.string(),
    address: z.string(),
    yearsOfExperience: z.number().min(0),
    institutionName: z.string().optional(),
    institutionPhoneNumber: z.string().optional(),
    registeringAs: z.enum(["Cybersecurity Professional","Other"]),
    otherDetails: z.string().optional()
  })
});

export const establishmentSchema = z.object({
  account: accountInfoSchema,
  establishment: z.object({
    sector: z.string(),
    name: z.string(),
    businessRegistrationNumber: z.string(),
    tin: z.string(),
    dateIncorporated: z.string(),
    employeeSize: z.string(),
    noOfAccreditedProfessionals: z.number().optional(),
    emailAddress: z.string().email(),
    website: z.string().optional(),
    mobileNumber: z.string(),
    physicalAddress: z.string(),
    postalAddress: z.string().optional(),
    ghanaPostAddress: z.string(),
    coreBusinessService: z.string(),
    description: z.string().optional()
  })
});

export type ProviderInput = z.infer<typeof providerSchema>;
export type ProfessionalInput = z.infer<typeof professionalSchema>;
export type EstablishmentInput = z.infer<typeof establishmentSchema>;
