import swaggerJSDoc from "swagger-jsdoc";
import config from "../config";

const version = "1.0.0";
const base = `/api/${config.apiVersion}`;

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
      { url: `http://localhost:${config.port}${base}`, description: "Local" },
      {
        url: `https://csa-backend-aw3ly80hi-factorghs-projects.vercel.app${base}`,
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
        ProviderApplication: { type: "object" },
        ProfessionalApplication: { type: "object" },
        EstablishmentApplication: { type: "object" },
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
          requestBody: { required: true },
          responses: { "201": { description: "Created" } },
        },
      },
      [`${base}/applications/establishment`]: {
        post: {
          tags: ["Applications"],
          summary: "Create establishment application (draft)",
          requestBody: { required: true },
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
          requestBody: { required: true },
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
          requestBody: { required: true },
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/admin/applications/{id}/approve`]: {
        post: {
          tags: ["Admin"],
          summary: "Approve application",
          parameters: [{ in: "path", name: "id", required: true }],
          requestBody: { required: false },
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/admin/applications/{id}/reject`]: {
        post: {
          tags: ["Admin"],
          summary: "Reject application",
          parameters: [{ in: "path", name: "id", required: true }],
          requestBody: { required: true },
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/admin/applications/{id}/request-docs`]: {
        post: {
          tags: ["Admin"],
          summary: "Request documents",
          parameters: [{ in: "path", name: "id", required: true }],
          requestBody: { required: true },
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
