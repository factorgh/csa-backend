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
        Dropdown: {
          type: "object",
          properties: {
            _id: { type: "string" },
            category: {
              type: "string",
              enum: [
                "SECTOR",
                "EMPLOYEE_SIZE",
                "PROFESSIONAL_TYPE",
                "DESIGNATION",
                "ID_TYPE",
                "SERVICE_TYPE",
              ],
            },
            label: { type: "string" },
            value: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        DropdownUpsertRequest: {
          type: "object",
          required: ["category", "label", "value"],
          properties: {
            category: {
              $ref: "#/components/schemas/Dropdown/properties/category",
            },
            label: { type: "string" },
            value: { type: "string" },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            email: { type: "string", format: "email" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            middleName: { type: "string" },
            phoneNumber: { type: "string" },
            telephoneNumber: { type: "string" },
            role: {
              type: "string",
              enum: ["APPLICANT", "ADMIN", "REVIEWER", "SUPERADMIN"],
            },
            gender: { type: "string", enum: ["Male", "Female", "Other"] },
            status: {
              type: "string",
              enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "DELETED"],
            },
            lastLoginAt: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        License: {
          type: "object",
          properties: {
            _id: { type: "string" },
            applicationId: { type: "string" },
            licenseNumber: { type: "string" },
            type: { $ref: "#/components/schemas/ApplicationType" },
            issuedAt: { type: "string", format: "date-time" },
            expiresAt: { type: "string", format: "date-time" },
            status: {
              type: "string",
              enum: ["ACTIVE", "EXPIRED", "REVOKED", "SUSPENDED"],
            },
            verificationHash: { type: "string" },
            holderName: { type: "string" },
            holderEmail: { type: "string", format: "email" },
            organizationName: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
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
          required: [
            "email",
            "password",
            "confirmPassword",
            "firstName",
            "lastName",
          ],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            confirmPassword: { type: "string", minLength: 8 },
            firstName: { type: "string" },
            lastName: { type: "string" },
            middleName: { type: "string" },
            phoneNumber: { type: "string" },
            telephoneNumber: { type: "string" },
            designation: { type: "string" },
            gender: { type: "string", enum: ["Male", "Female", "Other"] },
            role: {
              type: "string",
              enum: ["APPLICANT", "ADMIN", "REVIEWER", "SUPERADMIN"],
            },
          },
        },
        RegisterWithApplicationRequest: {
          type: "object",
          required: ["user", "application"],
          properties: {
            user: {
              type: "object",
              required: [
                "email",
                "password",
                "confirmPassword",
                "firstName",
                "lastName",
              ],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 8 },
                confirmPassword: { type: "string", minLength: 8 },
                firstName: { type: "string" },
                lastName: { type: "string" },
                middleName: { type: "string" },
                phoneNumber: { type: "string" },
                telephoneNumber: { type: "string" },
                designation: { type: "string" },
                gender: { type: "string", enum: ["Male", "Female", "Other"] },
                role: {
                  type: "string",
                  enum: ["APPLICANT", "ADMIN", "REVIEWER", "SUPERADMIN"],
                },
              },
            },
            application: {
              oneOf: [
                {
                  $ref: "#/components/schemas/ProviderRegistrationApplication",
                },
                {
                  $ref: "#/components/schemas/ProfessionalRegistrationApplication",
                },
                {
                  $ref: "#/components/schemas/EstablishmentRegistrationApplication",
                },
              ],
              discriminator: {
                propertyName: "type",
                mapping: {
                  PROVIDER:
                    "#/components/schemas/ProviderRegistrationApplication",
                  PROFESSIONAL:
                    "#/components/schemas/ProfessionalRegistrationApplication",
                  ESTABLISHMENT:
                    "#/components/schemas/EstablishmentRegistrationApplication",
                },
              },
              description:
                "Application payload. Set 'type' to one of: PROVIDER | PROFESSIONAL | ESTABLISHMENT. The 'data' object must match the selected type.",
            },
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
        // Application payloads aligned with Joi (src/validation/application.schema.ts)
        ProviderApplication: {
          type: "object",
          required: [
            "companyName",
            "registrationNumber",
            "tin",
            "dateIncorporated",
            "employeeSize",
            "companyPhone",
            "companyEmail",
            "physicalAddress",
            "companyDescription",
            "coreBusinessService",
          ],
          properties: {
            companyName: { type: "string" },
            registrationNumber: { type: "string" },
            tin: { type: "string" },
            dateIncorporated: { type: "string" },
            employeeSize: { type: "string" },
            companyPhone: { type: "string" },
            companyMobile: { type: "string" },
            companyEmail: { type: "string", format: "email" },
            physicalAddress: { type: "string" },
            postalAddress: { type: "string" },
            website: { type: "string" },
            companyDescription: { type: "string" },
            coreBusinessService: { type: "string" },
            ghanaDigitalPostAddress: { type: "string" },
          },
        },
        ProfessionalApplication: {
          type: "object",
          required: [
            "professionalType",
            "designation",
            "idType",
            "idNumber",
            "physicalAddress",
            "registeringAs",
          ],
          properties: {
            professionalType: { type: "string", enum: ["LOCAL", "FOREIGN"] },
            idType: { type: "string" },
            idNumber: { type: "string" },
            physicalAddress: { type: "string" },
            yearsOfExperience: { type: "number", minimum: 0 },
            qualifications: { type: "array", items: { type: "string" } },
            registeringAs: { type: "string" },
          },
        },
        EstablishmentApplication: {
          type: "object",
          required: [
            "registeringAs",
            "establishmentName",
            "sector",
            "registrationNumber",
            "tin",
            "dateEstablished",
            "employeeSize",
            "establishmentPhone",
            "establishmentEmail",
            "physicalAddress",
          ],
          properties: {
            registeringAs: { type: "string" },
            establishmentName: { type: "string" },
            sector: { type: "string" },
            registrationNumber: { type: "string" },
            tin: { type: "string" },
            dateEstablished: { type: "string" },
            employeeSize: { type: "string" },
            establishmentPhone: { type: "string" },
            establishmentEmail: { type: "string", format: "email" },
            physicalAddress: { type: "string" },
            postalAddress: { type: "string" },
            ghanaPostAddress: { type: "string" },
            website: { type: "string" },
            numberOfAccreditedProfessionals: { type: "number" },
            description: { type: "string" },
            coreBusinessService: { type: "string" },
          },
        },
        // Composite App payloads used for registration (type + data)
        ProviderRegistrationApplication: {
          type: "object",
          required: ["type", "data"],
          properties: {
            type: { type: "string", enum: ["PROVIDER"] },
            data: { $ref: "#/components/schemas/ProviderApplication" },
          },
        },
        ProfessionalRegistrationApplication: {
          type: "object",
          required: ["type", "data"],
          properties: {
            type: { type: "string", enum: ["PROFESSIONAL"] },
            data: { $ref: "#/components/schemas/ProfessionalApplication" },
          },
        },
        EstablishmentRegistrationApplication: {
          type: "object",
          required: ["type", "data"],
          properties: {
            type: { type: "string", enum: ["ESTABLISHMENT"] },
            data: { $ref: "#/components/schemas/EstablishmentApplication" },
          },
        },
        // Admin payloads (from src/validation/admin.schema.ts)
        ReviewRequest: {
          type: "object",
          properties: { notes: { type: "string", nullable: true } },
        },
        ApproveRequest: {
          type: "object",
          properties: { expiresAt: { type: "string", format: "date-time" } },
        },
        RejectRequest: {
          type: "object",
          required: ["comment"],
          properties: { comment: { type: "string" } },
        },
        RequestDocsRequest: {
          type: "object",
          required: ["docs"],
          properties: { docs: { type: "array", items: { type: "string" } } },
        },
        CreateStaffRequest: {
          type: "object",
          required: [
            "email",
            "password",
            "confirmPassword",
            "firstName",
            "lastName",
            "role",
          ],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            confirmPassword: { type: "string", minLength: 8 },
            firstName: { type: "string" },
            lastName: { type: "string" },
            middleName: { type: "string" },
            phoneNumber: { type: "string" },
            telephoneNumber: { type: "string" },
            designation: { type: "string" },
            gender: { type: "string", enum: ["Male", "Female", "Other"] },
            role: { type: "string", enum: ["REVIEWER", "ADMIN"] },
          },
        },
        UpdateUserStatusRequest: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              description: "New status to set for the user",
              enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "DELETED"],
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      // Admin Users
      [`${base}/admin/users`]: {
        get: {
          tags: ["Admin"],
          summary: "List users",
          parameters: [
            { in: "query", name: "role", schema: { type: "string" } },
            { in: "query", name: "status", schema: { type: "string" } },
            { in: "query", name: "email", schema: { type: "string" } },
            { in: "query", name: "name", schema: { type: "string" } },
            { in: "query", name: "page", schema: { type: "integer" } },
            { in: "query", name: "limit", schema: { type: "integer" } },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/User" },
                      },
                      pagination: {
                        type: "object",
                        properties: {
                          page: { type: "integer" },
                          limit: { type: "integer" },
                          total: { type: "integer" },
                          pages: { type: "integer" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

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
      [`${base}/auth/register-with-application`]: {
        post: {
          tags: ["Auth"],
          summary: "Register user and create initial application",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RegisterWithApplicationRequest",
                },
                examples: {
                  Provider: {
                    summary: "Provider registration",
                    value: {
                      user: {
                        email: "john.doe@example.com",
                        password: "Password123!",
                        confirmPassword: "Password123!",
                        firstName: "John",
                        lastName: "Doe",
                        phoneNumber: "+15550001111",
                        telephoneNumber: "+15550002222",
                        gender: "Male",
                        designation: "Manager",
                      },
                      application: {
                        type: "PROVIDER",
                        data: {
                          companyName: "Acme Cyber",
                          registrationNumber: "BRN-12345",
                          tin: "TIN-123456789",
                          dateIncorporated: "2023-01-01",
                          employeeSize: "11-50",
                          companyPhone: "+15550001111",
                          companyEmail: "contact@acme.test",
                          physicalAddress: "123 Main St",
                          companyDescription: "Managed Security services",
                          coreBusinessService: "Managed Security",
                          companyMobile: "+15550002222",
                          website: "https://acme.test",
                          postalAddress: "123 Main St",
                          ghanaDigitalPostAddress: "123 Main St",
                        },
                      },
                    },
                  },
                  Professional: {
                    summary: "Professional registration",
                    value: {
                      user: {
                        email: "jane.pro@example.com",
                        password: "Password123!",
                        confirmPassword: "Password123!",
                        firstName: "Jane",
                        lastName: "Pro",
                        phoneNumber: "+15550003333",
                        telephoneNumber: "+15550004444",
                        gender: "Female",
                        designation: "Analyst",
                      },
                      application: {
                        type: "PROFESSIONAL",
                        data: {
                          professionalType: "LOCAL",
                          idType: "Ghana Card",
                          idNumber: "GHA-000111222",
                          country: "Ghana",
                          city: "Accra",
                          physicalAddress: "456 Side St, Accra",
                          yearsOfExperience: 3,
                          qualifications: ["BSc Computer Science"],
                          registeringAs: "Cybersecurity Professional",
                          institutionName: "Acme University",
                          institutionPhoneNumber: "+15550003333",
                          institutionAddress: "456 Side St, Accra",
                        },
                      },
                    },
                  },
                  Establishment: {
                    summary: "Establishment registration",
                    value: {
                      user: {
                        email: "ops@example.com",
                        password: "Password123!",
                        confirmPassword: "Password123!",
                        firstName: "Ops",
                        lastName: "Team",
                        phoneNumber: "+15550005555",
                        telephoneNumber: "+15550006666",
                        gender: "Male",
                        designation: "Manager",
                      },
                      application: {
                        type: "ESTABLISHMENT",
                        data: {
                          registeringAs: "Accreditation",
                          establishmentName: "Secure Bank",
                          sector: "Finance",
                          registrationNumber: "BRN-98765",
                          tin: "TIN-987654321",
                          dateEstablished: "2019-05-20",
                          employeeSize: "201-500",
                          establishmentPhone: "+15550999888",
                          establishmentEmail: "info@securebank.test",
                          physicalAddress: "789 Corporate Ave",
                          postalAddress: "789 Corporate Ave",
                          website: "https://securebank.test",
                          ghanaDigitalPostAddress: "789 Corporate Ave",
                          numberOfAccreditedProfessionals: 10,
                          description: "Secure Bank is a financial institution",
                          coreBusinessService: "Banking",
                        },
                      },
                    },
                  },
                },
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
                schema: { $ref: "#/components/schemas/ForgotPasswordRequest" },
              },
            },
          },
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/auth/reset-password`]: {
        post: {
          tags: ["Auth"],
          summary: "Reset password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ResetPasswordRequest" },
              },
            },
          },
          responses: { "200": { description: "OK" } },
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
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProfessionalApplication",
                },
              },
            },
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
                schema: {
                  $ref: "#/components/schemas/EstablishmentApplication",
                },
              },
            },
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
                    { $ref: "#/components/schemas/EstablishmentApplication" },
                  ],
                },
              },
            },
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
            { in: "query", name: "applicantName", schema: { type: "string" } },
            { in: "query", name: "email", schema: { type: "string" } },
            { in: "query", name: "institution", schema: { type: "string" } },
            { in: "query", name: "page", schema: { type: "integer" } },
            { in: "query", name: "limit", schema: { type: "integer" } },
            {
              in: "query",
              name: "startDate",
              schema: { type: "string", format: "date-time" },
            },
            {
              in: "query",
              name: "endDate",
              schema: { type: "string", format: "date-time" },
            },
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
                schema: { $ref: "#/components/schemas/ReviewRequest" },
              },
            },
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
                schema: { $ref: "#/components/schemas/ApproveRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Approved. Returns application and license metadata",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "object",
                        properties: {
                          app: { type: "object" },
                          license: { $ref: "#/components/schemas/License" },
                        },
                      },
                    },
                  },
                  examples: {
                    Approved: {
                      value: {
                        success: true,
                        data: {
                          app: { _id: "64f...", status: "APPROVED" },
                          license: {
                            _id: "65a...",
                            applicationId: "64f...",
                            licenseNumber: "PRV-2025-000123",
                            type: "PROVIDER",
                            issuedAt: "2025-10-07T12:00:00.000Z",
                            expiresAt: "2026-10-07T12:00:00.000Z",
                            status: "ACTIVE",
                            verificationHash: "abc123hash",
                            holderName: "Holder",
                            holderEmail: "holder@example.com",
                            organizationName: "Acme Cyber",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
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
                schema: { $ref: "#/components/schemas/RejectRequest" },
              },
            },
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
                schema: { $ref: "#/components/schemas/RequestDocsRequest" },
              },
            },
          },
          responses: { "200": { description: "OK" } },
        },
      },
      [`${base}/admin/users/{id}`]: {
        get: {
          tags: ["Admin"],
          summary: "Get user by id",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
            "404": { description: "Not found" },
          },
        },
        patch: {
          tags: ["Admin"],
          summary: "Update user status",
          parameters: [{ in: "path", name: "id", required: true }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateUserStatusRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
            "404": { description: "User not found" },
            "401": { description: "Unauthorized" },
            "403": { description: "Forbidden" },
          },
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
          parameters: [
            { in: "query", name: "action", schema: { type: "string" } },
            { in: "query", name: "userId", schema: { type: "string" } },
            {
              in: "query",
              name: "startDate",
              schema: { type: "string", format: "date-time" },
            },
            {
              in: "query",
              name: "endDate",
              schema: { type: "string", format: "date-time" },
            },
            { in: "query", name: "limit", schema: { type: "integer" } },
          ],
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
      [`${base}/admin/dropdowns`]: {
        post: {
          tags: ["Admin"],
          summary: "Create dropdown item",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DropdownUpsertRequest" },
              },
            },
          },
          responses: { "201": { description: "Created" } },
        },
      },
      [`${base}/admin/dropdowns/{id}`]: {
        put: {
          tags: ["Admin"],
          summary: "Update dropdown item",
          parameters: [{ in: "path", name: "id", required: true }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DropdownUpsertRequest" },
              },
            },
          },
          responses: { "200": { description: "OK" } },
        },
        delete: {
          tags: ["Admin"],
          summary: "Delete dropdown item",
          parameters: [{ in: "path", name: "id", required: true }],
          responses: { "204": { description: "No Content" } },
        },
      },
      [`${base}/admin/reports/applicants.csv`]: {
        get: {
          tags: ["Admin"],
          summary: "Export applicants as CSV",
          parameters: [
            { in: "query", name: "type", schema: { type: "string" } },
            { in: "query", name: "status", schema: { type: "string" } },
            {
              in: "query",
              name: "startDate",
              schema: { type: "string", format: "date-time" },
            },
            {
              in: "query",
              name: "endDate",
              schema: { type: "string", format: "date-time" },
            },
          ],
          responses: { "200": { description: "CSV stream" } },
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
