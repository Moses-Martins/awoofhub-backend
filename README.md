# AwoofHub Backend API
A robust NestJS REST API providing secure authentication, Google OAuth 2.0 integration, and real-time chat user synchronization.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Package Structure](#package-structure)
- [Layer Responsibilities](#layer-responsibilities)
- [Key Design Decisions](#key-design-decisions)
- [Security Model](#security-model)
- [Authentication Flows](#authentication-flows)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Swagger UI](#swagger-ui)

## Tech Stack
| Concern | Technology |
| :--- | :--- |
| Language | TypeScript |
| Framework | NestJS 10.x |
| Persistence | TypeORM + PostgreSQL |
| Security | Passport.js (JWT & Google OAuth 2.0) |
| API Docs | Swagger (OpenAPI 3.0) |
| Mailing | Handlebars Templates |
| Runtime | Node.js |

## Architecture Overview
The project follows a modular NestJS architecture, emphasizing clear separation between the transport layer (Controllers), business logic (Services), and data access (Entities).

```text
┌─────────────────────────────────────────────────────────┐
│                    interfaces/                          │
│         (REST Controllers, DTOs, Guards)                │
│                          │                              │
│                          ▼                              │
│                    application/                         │
│              (AuthService, UsersService)                │
│                          │                              │
│                          ▼                              │
│                      domain/                            │
│            (Entities, Enums, TypeORM Repos)             │
│                          │                              │
│                          ▼                              │
│                    infrastructure/                      │
│         (MailService, ChatService, Passport)            │
└─────────────────────────────────────────────────────────┘
```

## Package Structure
```text
src/
├── auth/
│   ├── dto/                  # Login, Signup, and Reset DTOs
│   ├── entities/             # RefreshToken, PasswordResetToken
│   ├── strategy/             # Google OAuth Passport strategy
│   ├── auth.controller.ts    # Auth routing and cookie management
│   ├── auth.service.ts       # Authentication business logic
│   └── auth.module.ts        # Auth dependency injection
├── users/                    # User management and profile logic
├── mail/                     # Email dispatching (Handlebars templates)
├── chat/                     # Chat synchronization logic
└── common/                   # Global types and Enums
```

## Layer Responsibilities

### Auth Controller
The entry point for all authentication requests. It handles:
- Request validation via DTOs.
- Secure Cookie management (`httpOnly`, `secure`, `signed`).
- Response transformation (using `class-transformer`).
- Redirection logic for OAuth callbacks.

### Auth Service
The core orchestration layer. It manages:
- Password hashing and verification via `bcrypt`.
- JWT issuance for Access and Verification tokens.
- **Refresh Token Rotation**: Implementing a secure database-backed rotation strategy.
- Integration with `ChatService` to ensure user profiles stay in sync during authentication events.

### Entities
- **User**: Central user model (Local vs Google provider).
- **RefreshToken**: Stores hashed versions of active refresh tokens to prevent replay attacks.
- **PasswordResetToken**: Short-lived tokens for secure recovery.

## Key Design Decisions

1.  **Refresh Token Rotation (RTR)**
    To mitigate the risk of stolen long-lived tokens, every time a refresh token is used, it is revoked, and a new one is issued. We store a SHA-256 hash of the token in the database for secure validation.

2.  **Cookie-Based JWT Storage**
    Access and Refresh tokens are delivered via `signed`, `httpOnly` cookies. This prevents XSS-based token theft and provides a seamless "silent refresh" experience for the frontend.

3.  **Chat Provider Synchronization**
    The `AuthService` triggers a `syncUser` call to the `ChatService` during login, email verification, and token refresh. This ensures the chat engine always has the latest user metadata (name, avatar).

4.  **Google OAuth Auto-Provisioning**
    Users signing up via Google have their accounts automatically created and their emails marked as verified. We identify existing accounts by email to prevent duplicate registration.

5.  **Secure Password Reset**
    The reset flow uses short-lived (15 min) hashed tokens. Upon a successful reset, all active refresh tokens for that user are revoked, forcing a global logout for security.

6.  **Environment-Aware Cookie Scoping**
    Cookies are automatically configured with `domain: .awoofhub.online` in production to support cross-subdomain authentication, while remaining flexible for `localhost` development.

## Security Model
| Token Type | Lifespan | Storage | Purpose |
| :--- | :--- | :--- | :--- |
| **Access Token** | 15 Minutes | Signed Cookie | API Authorization |
| **Refresh Token** | 7 Days | Signed Cookie + DB | Token Renewal |
| **Verify Token** | 15 Minutes | JWT Payload | Email Confirmation |
| **Reset Token** | 15 Minutes | DB (Hashed) | Password Recovery |

## Authentication Flows

### Local Login
1. Validate credentials.
2. Check `isEmailVerified` status.
3. Sync user with Chat provider.
4. Issue JWT pair and set signed cookies.

### Refresh Token Flow
1. Extract signed `refresh_token` from request.
2. Hash the token and verify against the database.
3. Check for revocation or expiration.
4. Perform a transaction: Revoke old token → Generate new pair.

## API Endpoints

### Authentication
`POST /auth/signup` - Register local account.
`POST /auth/login` - Authenticate and receive cookies.
`GET  /auth/google` - Initiate Google OAuth.
`POST /auth/refresh` - Rotate tokens via cookie.
`POST /auth/logout` - Revoke tokens and clear cookies.

### Verification & Recovery
`POST /auth/verify-email` - Confirm email via token.
`POST /auth/resend-verification` - Resend signup mail.
`POST /auth/forgot-password` - Request reset link.
`POST /auth/reset-password` - Update password with token.

## Environment Variables
| Variable | Description |
| :--- | :--- |
| `JWT_SECRET` | Secret key for signing access tokens |
| `COOKIE_SECRET` | Secret for signing HTTP-only cookies |
| `NODE_ENV` | Environment (development/production) |
| `FRONTEND_URL` | Destination for OAuth redirects |
| `DATABASE_URL` | TypeORM connection string |
| `GOOGLE_CLIENT_ID` | OAuth2 Client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth2 Secret |

## Running Locally

### Prerequisites
- Node.js 18+
- PostgreSQL

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file in the root directory (refer to the table above).

3. **Start Database**
   Ensure PostgreSQL is running and the database matches your configuration.

4. **Run Application**
   ```bash
   # development
   npm run start:dev

   # production mode
   npm run build
   npm run start:prod
   ```

## Swagger UI
Documentation is available at:
`http://localhost:<PORT>/api`

*Note: Use the "Authorize" button to manage session state when testing protected endpoints, though the API primarily relies on Cookie-based authentication.*