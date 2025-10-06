# CSA Licensing & Accreditation Backend API

A centralized web-based system for managing cybersecurity licensing and accreditation for service providers, professionals, and establishments.

## Features

- 🔐 JWT Authentication & Role-Based Access Control
- 📝 Three Application Modules (Provider, Professional, Establishment)
- 👨‍💼 Admin Dashboard with Review Workflows
- 📊 Analytics & Reporting (CSV/PDF Export)
- 🔔 Email/SMS Notifications
- 📋 Audit Trail for All Actions
- 🎫 Auto License/Certificate Generation
- 📤 Document Upload Management
- 🔍 Public License Verification

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs
- **Validation**: Joi
- **File Upload**: Multer
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration

# Seed initial dropdown data
npm run seed

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/logout` - Logout user

### Applicant Endpoints
- `GET /me` - Get user profile
- `PUT /me` - Update profile
- `POST /applications/provider` - Create provider application
- `POST /applications/professional` - Create professional application
- `POST /applications/establishment` - Create establishment application
- `PUT /applications/:id` - Update application draft
- `GET /applications/:id` - Get application details
- `GET /applications` - List own applications
- `POST /applications/:id/submit` - Submit application
- `POST /applications/:id/upload` - Upload documents

### Admin Endpoints
- `GET /admin/applications` - List all applications (with filters)
- `GET /admin/applications/:id` - Get application details with audit
- `POST /admin/applications/:id/review` - Set application under review
- `POST /admin/applications/:id/approve` - Approve application
- `POST /admin/applications/:id/reject` - Reject application
- `POST /admin/applications/:id/request-docs` - Request additional documents
- `PATCH /admin/users/:id` - Manage user (suspend/reactivate)
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/reports` - Export reports (CSV/PDF)
- `GET /admin/stats` - Dashboard statistics
- `GET /admin/audit` - Audit logs

### Dropdown & Utilities
- `GET /dropdowns` - Get dropdown lists
- `POST /admin/dropdowns` - Manage dropdown items (admin only)
- `GET /license/:licenseNumber` - Verify license
- `GET /health` - Health check

## Roles & Permissions

- **APPLICANT** - Apply and manage own applications
- **REVIEWER** - Review applications and make recommendations
- **ADMIN** - Full application management and user control
- **SUPERADMIN** - System-level configuration and full access

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic
├── validation/      # Joi schemas
├── utils/           # Helper functions
├── types/           # TypeScript types
├── jobs/            # Background jobs
├── scripts/         # Utility scripts
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT

## Support

For support, email support@csa.gov
