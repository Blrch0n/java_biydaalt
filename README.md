# Online Learning System

Full-stack role-based learning platform with JWT authentication.

- Backend: Spring Boot 3.5, MongoDB, Spring Security, JJWT
- Frontend: Next.js 16 App Router, TypeScript, Tailwind CSS
- Roles: STUDENT, TEACHER

## Project Summary

This repository provides a complete online learning system where users can sign up, log in, browse courses, and track enrollments. Teachers can manage students, instructors, courses, lessons, and enrollment progress. Students can view courses and their own enrollment progress.

## Architecture

- Frontend (frontend): UI, auth state, protected routes, role-aware pages
- Backend (backend): REST API, JWT auth, role checks, business rules
- Database (MongoDB): persistent storage for users, students, instructors, courses, enrollments

## Request Flow

1. User logs in from frontend.
2. Backend validates credentials and returns JWT token.
3. Frontend stores token and sends it in Authorization header.
4. JWT filter authenticates request and sets security context.
5. Controller calls service layer.
6. Service enforces domain rules and role restrictions.
7. Repository reads or writes MongoDB.
8. API returns JSON success data or standardized error response.

## Auth Flow

1. POST /api/auth/signup creates a user and linked role profile.
2. POST /api/auth/login returns token and user payload.
3. Frontend stores token in localStorage and calls GET /api/auth/me on refresh.
4. Unauthorized responses clear token and redirect to login.

## Role Permissions

| Feature | STUDENT | TEACHER |
|---|---|---|
| View own profile (auth/me) | Yes | Yes |
| View courses, instructors, dashboard stats | Yes | Yes |
| View enrollments | Own only | All |
| Create/update/delete students | No | Yes |
| Create/update/delete instructors | No | Yes |
| Create/update/delete courses | No | Yes |
| Add/remove lessons | No | Yes |
| Create/delete enrollments | No | Yes |
| Update enrollment progress | No | Yes |

## Backend Structure

- Controllers: HTTP endpoints and request mapping
- Services: business logic and role-aware access rules
- Repositories: Spring Data MongoDB interfaces
- Security: JWT service, auth filter, security chain, entry-point handlers
- DTOs: auth, dashboard, enrollment response contracts
- Exceptions: standardized API error responses

## Frontend Structure

- App Router pages for dashboard, students, courses, enrollments, auth pages
- Auth context and guard for protected routing
- Centralized API client with token auto-attach
- Reusable UI components for headers, status, loading, nav
- Shared TypeScript contracts matching backend JSON

## Project Folder Tree

```text
biydaalt/
├─ README.md
├─ backend/
│  ├─ pom.xml
│  └─ src/
│     ├─ main/java/com/school/onlinelearning/
│     │  ├─ config/
│     │  │  ├─ CorsConfig.java
│     │  │  └─ SecurityConfig.java
│     │  ├─ controller/
│     │  │  ├─ AuthController.java
│     │  │  ├─ StudentController.java
│     │  │  ├─ InstructorController.java
│     │  │  ├─ CourseController.java
│     │  │  ├─ EnrollmentController.java
│     │  │  └─ DashboardController.java
│     │  ├─ dto/
│     │  ├─ exception/
│     │  ├─ model/
│     │  ├─ repository/
│     │  ├─ security/
│     │  └─ service/
│     ├─ main/resources/application.properties
│     └─ test/java/com/school/onlinelearning/
└─ frontend/
   ├─ package.json
   ├─ .env.local.example
   ├─ app/
   │  ├─ page.tsx
   │  ├─ login/page.tsx
   │  ├─ signup/page.tsx
   │  ├─ students/page.tsx
   │  ├─ instructors/page.tsx
   │  ├─ courses/page.tsx
   │  ├─ enroll/page.tsx
   │  └─ enrollments/page.tsx
   ├─ components/
   ├─ context/AuthContext.tsx
   ├─ lib/
   │  ├─ api.ts
   │  └─ auth.ts
   └─ types/index.ts
```

## Environment Variables

Backend:

- MONGODB_URI: MongoDB Atlas connection URI
- JWT_SECRET: Base64-encoded secret for HS256 signing
- JWT_EXPIRATION_MS: optional token life in milliseconds, default 86400000
- PORT: optional server port, default 8080
- CORS_ALLOWED_ORIGINS: comma-separated frontend origins

Frontend:

- NEXT_PUBLIC_API_URL: backend base URL, example http://localhost:8080

## Local Run Instructions

Backend:

```bash
cd backend
chmod +x mvnw
./mvnw spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

## Key Endpoints

Auth:

- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

Students (teacher only):

- GET /api/students?search=
- POST /api/students
- PUT /api/students/{id}
- DELETE /api/students/{id}

Instructors:

- GET /api/instructors
- GET /api/instructors/{id}
- POST /api/instructors (teacher)
- PUT /api/instructors/{id} (teacher)
- DELETE /api/instructors/{id} (teacher)

Courses:

- GET /api/courses?level=
- GET /api/courses/{id}
- POST /api/courses (teacher)
- PUT /api/courses/{id} (teacher)
- DELETE /api/courses/{id} (teacher)
- POST /api/courses/{courseId}/lessons (teacher)
- DELETE /api/courses/{courseId}/lessons/{lessonIndex} (teacher)

Enrollments:

- GET /api/enrollments?sort=progress|date
- GET /api/enrollments/{id}
- POST /api/enrollments (teacher)
- PATCH /api/enrollments/{id}/progress?value=75 (teacher)
- DELETE /api/enrollments/{id} (teacher)

Dashboard:

- GET /api/dashboard/stats

## Sample API Requests And Responses

Signup request:

```http
POST /api/auth/signup
Content-Type: application/json

{
  "fullName": "Teacher One",
  "email": "teacher1@example.com",
  "password": "secret123",
  "role": "TEACHER"
}
```

Signup response:

```json
{
  "id": "67f0b5b2a8c1ef3e2f0abc10",
  "fullName": "Teacher One",
  "email": "teacher1@example.com",
  "role": "TEACHER"
}
```

Login request:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "teacher1@example.com",
  "password": "secret123"
}
```

Login response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "67f0b5b2a8c1ef3e2f0abc10",
    "fullName": "Teacher One",
    "email": "teacher1@example.com",
    "role": "TEACHER"
  }
}
```

Create course request:

```http
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Java Fundamentals",
  "description": "Core Java concepts",
  "level": "BEGINNER",
  "price": 49.99,
  "instructorId": "67f0b5c7a8c1ef3e2f0abc22",
  "lessons": []
}
```

Create enrollment request:

```http
POST /api/enrollments
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "67f0b5dba8c1ef3e2f0abc31",
  "courseId": "67f0b62aa8c1ef3e2f0abc44",
  "progress": 0
}
```

Enrollment response:

```json
{
  "id": "67f0b6a1a8c1ef3e2f0abc52",
  "studentId": "67f0b5dba8c1ef3e2f0abc31",
  "studentName": "Student One",
  "courseId": "67f0b62aa8c1ef3e2f0abc44",
  "courseTitle": "Java Fundamentals",
  "progress": 0,
  "enrolledAt": "2026-04-04T12:30:00"
}
```

## Deployment Notes

### MongoDB Atlas

1. Create cluster and database user.
2. Add network access for your deployment providers.
3. Copy connection string into MONGODB_URI.

### Backend On Render

1. Create a Render Web Service from backend directory.
2. Build command: ./mvnw clean package -DskipTests
3. Start command: java -jar target/onlinelearning-0.0.1-SNAPSHOT.jar
4. Set env vars:
   - MONGODB_URI
   - JWT_SECRET
   - JWT_EXPIRATION_MS (optional)
   - CORS_ALLOWED_ORIGINS with your Vercel URL and local URL if needed
5. PORT is automatically provided by Render and now supported in application.properties.

### Frontend On Vercel

1. Import frontend directory as a Vercel project.
2. Framework preset: Next.js.
3. Set env var NEXT_PUBLIC_API_URL to your Render backend URL.
4. Redeploy after backend URL or CORS updates.

## Troubleshooting

- 401 Unauthorized:
  - verify token exists and is sent as Bearer header
  - confirm JWT_SECRET in backend environment is set and stable
- 403 Forbidden:
  - verify account role for the endpoint
- CORS errors in browser:
  - include frontend domain in CORS_ALLOWED_ORIGINS
- Mongo connection errors:
  - check MONGODB_URI credentials, network allow-list, and database user permissions
- Build issues:
  - frontend: run npm install then npm run lint and npm run build
  - backend: run ./mvnw test and ./mvnw clean package -DskipTests

## Security Notes

- Passwords are stored as BCrypt hashes.
- JWT tokens are signed server-side and validated in filter chain.
- Role checks are enforced with method-level security annotations.
- Public auth surface is limited to signup and login.
- For production, use HTTPS and strong secret management.

## Known Limitations

- No refresh token or token revocation list.
- No email verification or password reset flow.
- No pagination on list endpoints yet.
- Frontend currently uses localStorage token strategy.
- Integration tests run with expected warning logs from Mockito dynamic agent on newer JDKs.

## End-To-End Demo Flow

1. Start backend and frontend locally.
2. Sign up a TEACHER account.
3. Create instructor, student, and course records.
4. Add lessons to the course.
5. Create enrollment for a student.
6. Update progress from enrollments page.
7. Log out and sign up/login as STUDENT.
8. Verify student can view courses and own enrollment progress only.

## Verification Status

Validated during final polish pass:

- Backend tests: passed
- Backend package build: passed
- Frontend install: passed
- Frontend lint: passed
- Frontend type check: passed
- Frontend build: passed
