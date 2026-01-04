# E-Learning Platform

A comprehensive, secure, and scalable e-learning platform built with NestJS, MongoDB, and modern security practices following OWASP guidelines.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [User Roles & Account Status](#-user-roles--account-status)
- [Modules](#-modules)
- [Environment Variables](#-environment-variables)
- [Business Rules](#-business-rules)
- [Contributing](#-contributing)

---

## 🎯 Overview

This E-Learning Platform provides a complete solution for online education, featuring:

- **Multi-role support** for Students, Instructors, and Administrators
- **Adaptive learning** with intelligent quiz difficulty adjustment
- **Real-time communication** via chat and discussion forums
- **Comprehensive analytics** for tracking progress and engagement
- **Enterprise-grade security** with JWT (HTTP-only cookies), RBAC, rate limiting, and audit logging
- **Account lifecycle management** with status-based access control

---

## ✨ Features

### 1. User Management
| Feature | Description |
|---------|-------------|
| **Authentication** | JWT-based authentication with HTTP-only cookies |
| **Email Verification** | 6-digit OTP with 10-minute expiry |
| **Role-Based Access Control** | Three roles: Student, Instructor, Admin |
| **Account Status Management** | Active, Inactive, Locked, Suspended, Terminated |
| **Profile Management** | Update personal info, learning preferences, expertise |
| **Account Security** | Password hashing (bcrypt-12), account lockout, MFA support |

### 2. Course Management
| Feature | Description |
|---------|-------------|
| **Course Creation** | Hierarchical modules with multimedia resources |
| **Resource Types** | Videos, PDFs, and external links |
| **Version Control** | Track changes with version history |
| **Search & Discovery** | Search by title, instructor, tags |
| **Enrollment System** | Student enrollment with confirmation notifications |
| **Course Archiving** | Archive outdated courses |

### 3. Interactive Learning
| Feature | Description |
|---------|-------------|
| **Adaptive Quizzes** | Dynamic difficulty based on performance |
| **Instant Feedback** | Immediate quiz results with explanations |
| **Quick Notes** | Personal note-taking for each module |
| **Progress Tracking** | Track completion, scores, engagement |

### 4. Communication
| Feature | Description |
|---------|-------------|
| **Real-Time Chat** | Direct messaging and group study chats |
| **Discussion Forums** | Course-specific threaded discussions |
| **Notifications** | Course updates, announcements (Admin/Instructor only) |
| **Chat History** | Persistent conversation storage |

### 5. Analytics & Reporting
| Feature | Description |
|---------|-------------|
| **Student Dashboard** | Progress metrics, completion rates, scores |
| **Instructor Analytics** | Engagement reports, performance data |
| **Export Options** | CSV/JSON export for external analysis |
| **Admin Metrics** | Platform-wide statistics, security overview, account status breakdown |

### 6. Security & Compliance (OWASP)
| Feature | Description |
|---------|-------------|
| **JWT Authentication** | HTTP-only cookies (Secure, SameSite=Strict in production) |
| **Rate Limiting** | 100 requests/minute per IP (Throttler) |
| **Account Lockout** | Auto-lock after 5 failed login attempts (30 min) |
| **Audit Logging** | Comprehensive activity tracking |
| **Data Backup** | Scheduled automated backups |
| **Security Headers** | Helmet.js (XSS, CSP, HSTS, etc.) |
| **Input Validation** | Whitelist validation, sanitization, NoSQL injection prevention |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (NestJS)                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   Guards    │ │   Pipes     │ │    Interceptors          ││
│  │ - Auth      │ │ - Validate  │ │    - Logging             ││
│  │ - RBAC      │ │ - Sanitize  │ │    - Transform           ││
│  │ - Throttle  │ │             │ │                          ││
│  │ - Status    │ │             │ │                          ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│  │   Auth    │ │  Courses  │ │  Quizzes  │ │   Users   │   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│  │   Chat    │ │   Forum   │ │  Notifs   │ │ Analytics │   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     MongoDB Database                         │
│  Collections: Users, Courses, Quizzes, Forums, Messages...  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend Framework** | NestJS (Node.js, TypeScript) |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JWT (HTTP-only cookies) + bcrypt |
| **API Documentation** | Swagger/OpenAPI |
| **Security** | Helmet, Throttler, CORS, Input Validation |
| **Scheduling** | @nestjs/schedule (Cron jobs) |
| **Validation** | class-validator, class-transformer |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/e-learning-platform.git

# Navigate to backend
cd e-learning-platform/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run start:dev
```

### Environment Setup

Create a `.env` file:

```env
# Database
DATABASE_CONNECTION=mongodb://localhost:27017/elearning

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Email (for OTP)
MAIL_HOST=smtp.example.com
MAIL_USER=your-email@example.com
MAIL_PASS=your-email-password

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3999

# Backup
BACKUP_DIR=./backups
```

---

## 📚 API Documentation

Access Swagger documentation at: `http://localhost:5000/api`

### Authentication
- Uses **HTTP-Only Cookie Authentication**
- After login, `access_token` cookie is automatically set
- Cookie settings: `HttpOnly; Secure (prod); SameSite=Strict (prod)`

### Main Endpoints

| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/auth` | Registration, login, OTP, password reset |
| Users | `/users` | User profile management |
| Courses | `/courses` | Course CRUD, enrollment, resources |
| Quizzes | `/quizzes` | Quiz management |
| Quiz Attempts | `/quiz-attempts` | Take and review quizzes |
| Forums | `/forums` | Discussion threads and posts |
| Chat | `/chat` | Messaging and conversations |
| Notifications | `/notifications` | User notifications |
| Progress | `/progress` | Progress tracking |
| Notes | `/notes` | Quick notes |
| Analytics | `/analytics` | Performance analytics |
| Admin | `/admin` | Admin operations |
| Backups | `/api/backups` | Backup management |
| Audit | `/audit` | Audit logs |

---

## 🔒 Security

### Authentication Flow

```
1. User registers → Email verification OTP sent
2. User verifies OTP → Account activated (status: ACTIVE)
3. User logs in → JWT cookie set (HttpOnly, Secure, SameSite)
4. Each request → Token validated + Account status checked
5. 5 failed logins → Account LOCKED for 30 minutes
6. Logout → Token blacklisted, cookie cleared
```

### Security Features (OWASP Compliant)

| Feature | Implementation |
|---------|----------------|
| **A01 - Broken Access Control** | RBAC guards, account status checks |
| **A02 - Cryptographic Failures** | bcrypt-12, JWT with secure cookies |
| **A03 - Injection** | Input validation, sanitization, parameterized queries |
| **A04 - Insecure Design** | Defense in depth, principle of least privilege |
| **A05 - Security Misconfiguration** | Helmet.js, proper CORS, no debug in prod |
| **A06 - Vulnerable Components** | Regular dependency updates |
| **A07 - Authentication Failures** | Account lockout, secure session management |
| **A08 - Software Integrity** | Input validation, content-type checks |
| **A09 - Logging Failures** | Comprehensive audit logging |
| **A10 - SSRF** | Input validation, URL sanitization |

### Security Headers (Helmet.js)

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: default-src 'self'`

---

## 👥 User Roles & Account Status

### Roles (Enum: UserRole)

| Role | Permissions |
|------|-------------|
| **STUDENT** | Browse, enroll, learn, take quizzes, participate in forums/chat |
| **INSTRUCTOR** | Create courses/quizzes, view analytics, send course notifications |
| **ADMIN** | Full access, user management, platform announcements, security monitoring |

### Account Status (Enum: AccountStatus)

| Status | Description | Access |
|--------|-------------|--------|
| **ACTIVE** | Normal active account | Full access |
| **INACTIVE** | Manually deactivated | Blocked |
| **LOCKED** | Security lockout (5 failed logins) | Blocked (auto-unlock after 30 min) |
| **SUSPENDED** | Admin suspension | Blocked |
| **TERMINATED** | Permanently terminated | Blocked |

---

## 📦 Modules

| Module | Status | Description |
|--------|--------|-------------|
| Auth | ✅ | JWT cookies, OTP, password reset, account status |
| Users | ✅ | Profile management, search |
| Courses | ✅ | CRUD, enrollment, resources, archiving |
| Quizzes | ✅ | Adaptive quizzes with difficulty levels |
| Quiz Attempts | ✅ | Take quizzes, instant feedback |
| Forums | ✅ | Threads, posts, likes |
| Chat | ✅ | Direct & group messaging |
| Notifications | ✅ | Admin/Instructor only sending |
| Quick Notes | ✅ | Personal note-taking |
| Progress Tracking | ✅ | Course progress |
| Analytics | ✅ | Student & instructor stats |
| Admin | ✅ | User management, status control, metrics |
| Backup | ✅ | Automated backups |
| Audit Log | ✅ | Activity logging |
| Security | ✅ | Rate limit, lockout, headers |

---

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_CONNECTION` | Yes | - | MongoDB connection string |
| `JWT_SECRET` | Yes | - | Secret for signing JWTs (min 32 chars) |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiration |
| `PORT` | No | `5000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `MAIL_HOST` | Yes | - | SMTP server host |
| `MAIL_USER` | Yes | - | SMTP username |
| `MAIL_PASS` | Yes | - | SMTP password |
| `ALLOWED_ORIGINS` | No | `localhost:*` | CORS origins (comma-separated) |
| `BACKUP_DIR` | No | `./backups` | Backup directory |
| `ENABLE_SWAGGER` | No | `true` | Enable Swagger in production |

---

## 📋 Business Rules

### Authentication
1. ✅ Email must be unique and valid format
2. ✅ Password minimum 8 characters
3. ✅ OTP expires after 10 minutes
4. ✅ OTP resend cooldown: 2 minutes
5. ✅ Account locked after 5 failed login attempts (30 min)
6. ✅ Email must be verified before login
7. ✅ All account statuses except ACTIVE block access

### Courses
1. ✅ Only students can enroll in courses
2. ✅ Cannot enroll twice in same course
3. ✅ Only instructors can create/modify their own courses
4. ✅ Admins can override any restriction
5. ✅ Course must be "active" to allow enrollment

### Quizzes
1. ✅ Adaptive difficulty based on performance:
   - Score ≥ 80% → Next: Hard
   - Score 50-79% → Next: Medium
   - Score < 50% → Next: Easy

### Notifications
1. ✅ Only Admins can send platform-wide announcements
2. ✅ Only Admins and Instructors can send course notifications
3. ✅ Students can only view their own notifications

### Forums
1. ✅ Must be enrolled to participate in course forums
2. ✅ Only owners can delete their posts/threads
3. ✅ Like toggles (like/unlike)

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for learners everywhere**
