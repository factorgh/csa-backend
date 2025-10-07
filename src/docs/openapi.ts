import swaggerJSDoc from "swagger-jsdoc";
import config from "../config";
console.log("OPEN API");

const version = "1.0.0";
const base = ``;

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "CSA Licensing & Accreditation API",
      version,
      description: "OpenAPI docs for the CSA backend API",
      contact: { name: "CSA", email: "support@csa.gov" },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/${config.apiVersion}`,
        description: "Local",
      },
      {
        url: `https://csa-backend-utuw.onrender.com/api/${config.apiVersion}`,
        description: "Production",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: {},
            error: { type: "string" },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "fullName"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            fullName: { type: "string" },
            phone: { type: "string" },
            // Note: designation & gender are not validated/used by the current register endpoint
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
          },
        },
        // Application payloads (from src/validation/application.zod.ts)
        AccountInfo: {
          type: "object",
          required: ["firstname", "lastname", "email", "phoneNumber"],
          properties: {
            firstname: { type: "string" },
            middleName: { type: "string" },
            lastname: { type: "string" },
            email: { type: "string", format: "email" },
            phoneNumber: { type: "string" },
            telephoneNumber: { type: "string" },
            gender: { type: "string", enum: ["Male", "Female", "Other"] },
            designation: { type: "string" }
          }
        },
        ProviderApplication: {
          type: "object",
          required: ["account", "registration"],
          properties: {
            account: { $ref: "#/components/schemas/AccountInfo" },
            registration: {
              type: "object",
              required: [
                "nameOfInstitution",
                "businessRegistrationNumber",
                "tin",
                "dateIncorporated",
                "employeeSize",
                "emailAddress",
                "mobileNumber",
                "physicalAddress",
                "ghanaPostAddress",
                "coreBusinessService"
              ],
              properties: {
                nameOfInstitution: { type: "string" },
                businessRegistrationNumber: { type: "string" },
                tin: { type: "string" },
                dateIncorporated: { type: "string", format: "date" },
                employeeSize: { type: "string" },
                emailAddress: { type: "string", format: "email" },
                website: { type: "string" },
                mobileNumber: { type: "string" },
                physicalAddress: { type: "string" },
                postalAddress: { type: "string" },
                ghanaPostAddress: { type: "string" },
                coreBusinessService: { type: "string" },
                description: { type: "string" }
              }
            }
          }
        },
        ProfessionalApplication: {
          type: "object",
          required: ["account", "professional"],
          properties: {
            account: { $ref: "#/components/schemas/AccountInfo" },
            professional: {
              type: "object",
              required: [
                "professionalType",
                "designation",
                "nationalIdType",
                "idNumber",
                "city",
                "address",
                "yearsOfExperience",
                "registeringAs"
              ],
              properties: {
                professionalType: { type: "string", enum: ["Local", "Foreign"] },
                designation: { type: "string" },
                nationalIdType: { type: "string", enum: ["Ghana Card", "Passport"] },
                idNumber: { type: "string" },
                country: { type: "string" },
                city: { type: "string" },
                address: { type: "string" },
                yearsOfExperience: { type: "number", minimum: 0 },
                institutionName: { type: "string" },
                institutionPhoneNumber: { type: "string" },
                registeringAs: { type: "string", enum: ["Cybersecurity Professional", "Other"] },
                otherDetails: { type: "string" }
              }
            }
          }
        },
        EstablishmentApplication: {
          type: "object",
          required: ["account", "establishment"],
          properties: {
            account: { $ref: "#/components/schemas/AccountInfo" },
            establishment: {
              type: "object",
              required: [
                "sector",
                "name",
                "businessRegistrationNumber",
                "tin",
                "dateIncorporated",
                "employeeSize",
                "emailAddress",
                "mobileNumber",
                "physicalAddress",
                "ghanaPostAddress",
                "coreBusinessService"
              ],
              properties: {
                sector: { type: "string" },
                name: { type: "string" },
                businessRegistrationNumber: { type: "string" },
                tin: { type: "string" },
                dateIncorporated: { type: "string" },
                employeeSize: { type: "string" },
                noOfAccreditedProfessionals: { type: "number" },
                emailAddress: { type: "string", format: "email" },
                website: { type: "string" },
                mobileNumber: { type: "string" },
                physicalAddress: { type: "string" },
                postalAddress: { type: "string" },
                ghanaPostAddress: { type: "string" },
                coreBusinessService: { type: "string" },
                description: { type: "string" }
              }
            }
          }
        },
        // Admin payloads (from src/validation/admin.schema.ts)
        ReviewRequest: {
          type: "object",
          properties: { notes: { type: "string", nullable: true } }
        },
        ApproveRequest: {
          type: "object",
          properties: { expiresAt: { type: "string", format: "date-time" } }
        },
        RejectRequest: {
          type: "object",
          required: ["comment"],
          properties: { comment: { type: "string" } }
        },
        RequestDocsRequest: {
          type: "object",
          required: ["docs"],
          properties: { docs: { type: "array", items: { type: "string" } } }
        },
        // Auth extra payloads
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: { email: { type: "string", format: "email" } }
        },
        ResetPasswordRequest: {
          type: "object",
          required: ["token", "password"],
          properties: {
            token: { type: "string" },
            password: { type: "string", minLength: 8 }
          }
        }
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      // Auth
      [`${base}/auth/register`]: {
        post: {
          tags: ["Auth"],
          summary: "Register user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterRequest" },
              },
            },
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ApiResponse" },
                },
              },
            },
            "409": { description: "Conflict" },
          },
        },
      },
      [`${base}/auth/login`]: {
        post: {
          tags: ["Auth"],
          summary: "Login user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            "200": { description: "OK" },
            "401": { description: "Unauthorized" },
          },
        },
      },
      [`${base}/auth/forgot-password`]: {
        post: {
          tags: ["Auth"],
          summary: "Forgot password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ForgotPasswordRequest" }
              }
            }
          },
          responses: { "200": { description: "OK" } }
        }
      },
      [`${base}/auth/reset-password`]: {
        post: {
          tags: ["Auth"],
          summary: "Reset password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ResetPasswordRequest" }
              }
            }
          },
          responses: { "200": { description: "OK" } }
        }
      },
      [`${base}/auth/me`]: {
        get: {
          tags: ["Auth"],
          summary: "Get current user",
          responses: { "200": { description: "OK" } },
        },
        put: {
          tags: ["Auth"],
          summary: "Update current user",
          requestBody: { required: true },
          responses: { "200": { description: "OK" } },
        },
      },

      // Applicant Applications
      [`${base}/applications/provider`]: {
        post: {
          tags: ["Applications"],
          summary: "Create provider application (draft)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProviderApplication" },
              },
            },
          },
          responses: { "201": { description: "Created" } },
        },
      },
      [`${base}/applications/professional`]: {
        post: {
          tags: ["Applications"],
          summary: "Create professional application (draft)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProfessionalApplication" }
              }
            }
          },
          responses: { "201": { description: "Created" } },
        },
      },
      [`${base}/applications/establishment`]: {
        post: {
          tags: ["Applications"],
          summary: "Create establishment application (draft)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EstablishmentApplication" }
              }
            }
          },
          responses: { "201": { description: "Created" } },
        },
      },
      [`${base}/applications`]: {
        get: {
          tags: ["Applications"],
          summary: "List own applications",
          parameters: [
            { in: "query", name: "status", schema: { type: "string" } },
            { in: "query", name: "type", schema: { type: "string" } },
            { in: "query", name: "page", schema: { type: "integer" } },
            { in: "query", name: "limit", schema: { type: "integer" } },
          ],
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/applications/{id}`]: {
        get: {
          tags: ["Applications"],
          summary: "Get application by id",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: {
            "200": { description: "OK" },
            "404": { description: "Not found" },
          },
        },
        put: {
          tags: ["Applications"],
          summary: "Update application draft",
          parameters: [{ in: "path", name: "id", required: true }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/ProviderApplication" },
                    { $ref: "#/components/schemas/ProfessionalApplication" },
                    { $ref: "#/components/schemas/EstablishmentApplication" }
                  ]
                }
              }
            }
          },
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/applications/{id}/submit`]: {
        post: {
          tags: ["Applications"],
          summary: "Submit application",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/applications/{id}/upload`]: {
        post: {
          tags: ["Applications"],
          summary: "Upload supporting documents",
          parameters: [{ in: "path", name: "id", required: true }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    files: { type: "string", format: "binary" },
                    type: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "201": { description: "Created" } },
        },
      },

      // Admin
      [`${base}/admin/applications`]: {
        get: {
          tags: ["Admin"],
          summary: "List all applications",
          parameters: [
            { in: "query", name: "type", schema: { type: "string" } },
            { in: "query", name: "status", schema: { type: "string" } },
            { in: "query", name: "page", schema: { type: "integer" } },
            { in: "query", name: "limit", schema: { type: "integer" } },
            { in: "query", name: "startDate", schema: { type: "string", format: "date-time" } },
            { in: "query", name: "endDate", schema: { type: "string", format: "date-time" } },
          ],
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/admin/applications/{id}`]: {
        get: {
          tags: ["Admin"],
          summary: "Get application with audit",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/admin/applications/{id}/review`]: {
        post: {
          tags: ["Admin"],
          summary: "Set Under Review",
          parameters: [{ in: "path", name: "id", required: true }],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReviewRequest" }
              }
            }
          },
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/admin/applications/{id}/approve`]: {
        post: {
          tags: ["Admin"],
          summary: "Approve application",
          parameters: [{ in: "path", name: "id", required: true }],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApproveRequest" }
              }
            }
          },
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/admin/applications/{id}/reject`]: {
        post: {
          tags: ["Admin"],
          summary: "Reject application",
          parameters: [{ in: "path", name: "id", required: true }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RejectRequest" }
              }
            }
          },
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/admin/applications/{id}/request-docs`]: {
        post: {
          tags: ["Admin"],
          summary: "Request documents",
          parameters: [{ in: "path", name: "id", required: true }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RequestDocsRequest" }
              }
            }
          },
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/admin/users/{id}`]: {
        patch: {
          tags: ["Admin"],
          summary: "Suspend/Reactivate user",
          parameters: [{ in: "path", name: "id", required: true }],
          requestBody: { required: true },
          responses: { "200": { description: "OK" } },
        },
        delete: {
          tags: ["Admin"],
          summary: "Delete user (soft)",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/admin/stats`]: {
        get: {
          tags: ["Admin"],
          summary: "Stats overview",
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/admin/audit`]: {
        get: {
          tags: ["Admin"],
          summary: "Audit logs",
          responses: { "200": { description: "OK" } },
        },
      },

      // Dropdowns & Utilities
      [`${base}/dropdowns`]: {
        get: {
          tags: ["Dropdowns"],
          summary: "Get public dropdowns",
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/dropdowns/manage`]: {
        get: {
          tags: ["Dropdowns"],
          summary: "Manage dropdowns (admin)",
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/license/{licenseNumber}`]: {
        get: {
          tags: ["Utilities"],
          summary: "Verify license number",
          parameters: [{ in: "path", name: "licenseNumber", required: true }],
          responses: {
            "200": { description: "OK" },
            "404": { description: "Not found" },
          },
        },
      },
      [`/api/health`]: {
        get: {
          tags: ["Utilities"],
          summary: "Health check",
          responses: { "200": { description: "OK" } },
        },
      },
    },
  },
  apis: [],
});
