import Joi from 'joi';

export const providerSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  gender: Joi.string().optional(),
  designation: Joi.string().optional(),

  companyName: Joi.string().required(),
  registrationNumber: Joi.string().required(),
  tin: Joi.string().required(),
  dateIncorporated: Joi.date().required(),
  employeeSize: Joi.string().required(),
  companyPhone: Joi.string().required(),
  companyEmail: Joi.string().email().required(),
  physicalAddress: Joi.string().required(),
  postalAddress: Joi.string().optional(),
  website: Joi.string().uri().optional(),
  businessDescription: Joi.string().required(),
  serviceTypes: Joi.array().items(Joi.string()).optional()
});

export const professionalSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  gender: Joi.string().optional(),
  dateOfBirth: Joi.date().optional(),
  nationality: Joi.string().required(),
  professionalType: Joi.string().valid('LOCAL', 'FOREIGN').required(),
  designation: Joi.string().required(),
  idType: Joi.string().required(),
  idNumber: Joi.string().required(),
  physicalAddress: Joi.string().required(),
  postalAddress: Joi.string().optional(),
  yearsOfExperience: Joi.number().min(0).required(),
  qualifications: Joi.array().items(Joi.string()).required(),
  certifications: Joi.array().items(Joi.string()).optional(),
  currentInstitution: Joi.string().optional(),
  institutionAddress: Joi.string().optional(),
  registeringAs: Joi.string().required(),
  specialization: Joi.array().items(Joi.string()).optional()
});

export const establishmentSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  designation: Joi.string().optional(),

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
  website: Joi.string().uri().optional(),
  numberOfAccreditedProfessionals: Joi.number().min(0).optional(),
  complianceDescription: Joi.string().optional(),
  currentSecurityMeasures: Joi.array().items(Joi.string()).optional()
});
