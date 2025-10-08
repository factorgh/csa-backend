import Joi from "joi";

export const providerSchema = Joi.object({
  companyName: Joi.string().required(),
  registrationNumber: Joi.string().required(),
  tin: Joi.string().required(),
  dateIncorporated: Joi.date().required(),
  employeeSize: Joi.string().required(),
  companyPhone: Joi.string().required(),
  companyMobile: Joi.string().optional(),
  companyEmail: Joi.string().email().required(),
  physicalAddress: Joi.string().required(),
  postalAddress: Joi.string().optional(),
  website: Joi.string().uri().optional(),
  companyDescription: Joi.string().required(),
  coreBusinessService: Joi.string().required(),
  ghanaDigitalPostAddress: Joi.string().optional(),
});

export const professionalSchema = Joi.object({
  professionalType: Joi.string().valid("LOCAL", "FOREIGN").required(),
  idType: Joi.string().required(),
  idNumber: Joi.string().required(),
  country: Joi.string().optional(),
  city: Joi.string().optional(),
  physicalAddress: Joi.string().required(),
  yearsOfExperience: Joi.number().min(0).optional(),
  qualifications: Joi.array().items(Joi.string()).optional(),
  certifications: Joi.array().items(Joi.string()).optional(),
  institutionName: Joi.string().optional(),
  institutionPhoneNumber: Joi.string().optional(),
  registeringAs: Joi.string().required(),
  otherDetails: Joi.string().optional(),
});

export const establishmentSchema = Joi.object({
  registeringAs: Joi.string().required(),
  establishmentName: Joi.string().required(),
  sector: Joi.string().required(),
  registrationNumber: Joi.string().required(),
  tin: Joi.string().required(),
  dateEstablished: Joi.date().required(),
  employeeSize: Joi.string().required(),
  establishmentPhone: Joi.string().required(),
  establishmentEmail: Joi.string().email().required(),
  physicalAddress: Joi.string().required(),
  postalAddress: Joi.string().optional(),
  ghanaPostAddress: Joi.string().optional(),
  website: Joi.string().uri().optional(),
  numberOfAccreditedProfessionals: Joi.number().min(0).optional(),
  description: Joi.string().optional(),
  coreBusinessService: Joi.string().optional(),
});
