# Frontend: Online Learning UI

Next.js App Router frontend for the upgraded Spring Boot backend. This UI now includes JWT login/signup flow, route protection, role-based navigation, and teacher/student specific pages.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Fetch-based API client with centralized auth/error handling

## Environment

Create `.env.local` (or copy from `.env.local.example`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Run

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Authentication Flow

- Public routes: `/login`, `/signup`
- Protected routes: all others
- Token storage: `localStorage` key `onlinelearning_token`
- On app load: frontend calls `/api/auth/me` to restore session
- On `401`: token is cleared and user is redirected to login

## Roles and UX

- `TEACHER`
	- Full management routes: students, instructors, enrollment creation, enrollment progress updates
	- Can create/delete students, instructors, and courses
	- Can add lessons to courses
- `STUDENT`
	- Read-only access to course list and personal enrollments
	- No teacher management controls shown in UI

## Main Routes

- `/` dashboard with quick stats from `/api/dashboard/stats`
- `/students` teacher-only student management
- `/instructors` teacher-only instructor management
- `/courses` role-based course browsing/management
- `/enroll` teacher-only enrollment creation
- `/enrollments` teacher sees all, student sees own records from `/api/enrollments`
- `/login` signin
- `/signup` account creation

## Key Files

- `context/AuthContext.tsx`: auth state, restore/login/signup/logout
- `components/AuthGuard.tsx`: public/protected route guard
- `components/NavBar.tsx`: role-aware menu and logout
- `lib/api.ts`: all endpoint methods and auth header handling
- `lib/auth.ts`: token storage helpers
- `types/index.ts`: shared API/domain/auth types

## Scripts

- `npm run dev` start development server
- `npm run lint` run ESLint
- `npm run build` production build
