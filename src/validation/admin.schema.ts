import Joi from 'joi';

export const reviewSchema = Joi.object({
  notes: Joi.string().allow('', null).optional()
});

export const approveSchema = Joi.object({
  expiresAt: Joi.date().optional()
});

export const rejectSchema = Joi.object({
  comment: Joi.string().required()
});

export const requestDocsSchema = Joi.object({
  docs: Joi.array().items(Joi.string()).required()
});

export const listAppsSchema = Joi.object({
  type: Joi.string().valid('PROVIDER', 'PROFESSIONAL', 'ESTABLISHMENT').optional(),
  status: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(100).optional()
});

// Superadmin: create reviewer/admin
export const createStaffSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  middleName: Joi.string().allow('', null).optional(),
  phoneNumber: Joi.string().allow('', null).optional(),
  telephoneNumber: Joi.string().allow('', null).optional(),
  designation: Joi.string().allow('', null).optional(),
  gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
  role: Joi.string().valid('REVIEWER', 'ADMIN').required()
});
