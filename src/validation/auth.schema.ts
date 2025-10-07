import Joi from "joi";
import {
  providerSchema,
  professionalSchema,
  establishmentSchema,
} from "./application.schema";

// --- Shared Field Rules ---
const nameRule = Joi.string().trim().min(2).max(100);
const phoneRule = Joi.string()
  .pattern(/^[0-9+\-()\s]*$/)
  .trim()
  .messages({
    "string.pattern.base":
      "Phone number can only contain digits and symbols like + - ( )",
  });

// --- Registration Schema ---
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "any.required": "Password is required",
  }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required",
  }),

  firstName: nameRule.required().messages({
    "any.required": "First name is required",
  }),

  lastName: nameRule.required().messages({
    "any.required": "Last name is required",
  }),

  middleName: nameRule.allow("", null),

  phoneNumber: phoneRule.allow("", null),

  telephoneNumber: phoneRule.allow("", null),

  designation: Joi.string().trim().allow("", null),

  gender: Joi.string().valid("Male", "Female", "Other").optional(),

  role: Joi.string()
    .valid("APPLICANT", "ADMIN", "REVIEWER", "SUPERADMIN")
    .default("APPLICANT"),

  status: Joi.string()
    .valid("ACTIVE", "SUSPENDED", "DELETED")
    .default("ACTIVE"),
});

// --- Login Schema ---
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(8).required(),
});

// --- Forgot Password Schema ---
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email",
    "any.required": "Email is required",
  }),
});

// --- Reset Password Schema ---
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords do not match" }),
});

// --- Register With Application Schema ---
export const registerWithApplicationSchema = Joi.object({
  user: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(8).required().messages({
      "string.min": "Password must be at least 8 characters",
      "any.required": "Password is required",
    }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
        "any.required": "Confirm password is required",
      }),
    firstName: nameRule.required().messages({
      "any.required": "First name is required",
    }),
    lastName: nameRule.required().messages({
      "any.required": "Last name is required",
    }),
    middleName: nameRule.allow("", null),
    phoneNumber: phoneRule.allow("", null),
    telephoneNumber: phoneRule.allow("", null),
    designation: Joi.string().trim().allow("", null),
    gender: Joi.string().valid("Male", "Female", "Other").optional(),
    role: Joi.string()
      .valid("APPLICANT", "ADMIN", "REVIEWER", "SUPERADMIN")
      .default("APPLICANT"),
    status: Joi.string()
      .valid("ACTIVE", "SUSPENDED", "DELETED")
      .default("ACTIVE"),
  }).required(),
  application: Joi.object({
    type: Joi.string()
      .valid("PROVIDER", "PROFESSIONAL", "ESTABLISHMENT")
      .required(),
    data: Joi.alternatives()
      .conditional("type", {
        switch: [
          { is: "PROVIDER", then: providerSchema },
          { is: "PROFESSIONAL", then: professionalSchema },
          { is: "ESTABLISHMENT", then: establishmentSchema },
        ],
        otherwise: Joi.forbidden(),
      })
      .required(),
  }).required(),
});
