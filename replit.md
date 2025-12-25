# Workout Week Generator

## Overview

A full-stack web application that generates personalized weekly workout plans based on user preferences. Users input their fitness goals, experience level, available time, and any physical constraints, and the system generates a complete structured workout plan using deterministic logic and a hardcoded exercise library (no external AI APIs).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with HMR support
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion for UI transitions
- **Icons**: Lucide React

**Directory Structure**:
- `client/src/pages/` - Page components (Home, NotFound)
- `client/src/components/` - Reusable components including shadcn/ui primitives
- `client/src/hooks/` - Custom React hooks (useGeneratePlan, useToast, useMobile)
- `client/src/lib/` - Utilities (queryClient, cn helper)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ES modules)
- **API Pattern**: RESTful JSON API
- **Validation**: Zod schemas shared between client and server

**Directory Structure**:
- `server/index.ts` - Express app setup and middleware
- `server/routes.ts` - API route handlers
- `server/lib/generator.ts` - Workout plan generation logic
- `server/lib/exercises.ts` - Hardcoded exercise library with patterns (push, pull, squat, hinge, core, cardio, mobility)
- `server/storage.ts` - In-memory storage (MemStorage class)

### Shared Code
- `shared/schema.ts` - Zod schemas for user preferences, workout plans, exercises
- `shared/routes.ts` - API contract definitions with input/output schemas

### Data Flow
1. User fills form with preferences (goal, experience, days/week, duration, constraints)
2. Frontend validates with Zod, sends POST to `/api/generate-plan`
3. Backend validates input, runs deterministic generator logic
4. Generator selects exercises from library based on difficulty, focus, and constraints
5. Returns structured workout plan JSON
6. Frontend displays plan with accordion UI for each day

### Build System
- Development: `tsx` runs TypeScript directly
- Production: Custom build script using esbuild (server) + Vite (client)
- Output: `dist/` directory with `index.cjs` (server) and `public/` (client assets)

## External Dependencies

### Database
- **PostgreSQL** via `pg` driver
- **ORM**: Drizzle ORM with drizzle-zod for schema-to-Zod conversion
- **Migrations**: Drizzle Kit (`drizzle-kit push`)
- **Connection**: Requires `DATABASE_URL` environment variable
- **Note**: Current MVP uses in-memory storage; database schema exists but minimal usage

### UI Component Library
- **shadcn/ui**: Radix UI primitives with Tailwind styling
- Component path aliases configured in `components.json`
- Extensive primitive set: Accordion, Dialog, Select, Tabs, Toast, etc.

### Key Runtime Dependencies
- `express` - HTTP server
- `express-session` with `connect-pg-simple` - Session management
- `@tanstack/react-query` - Async state management
- `framer-motion` - Animations
- `react-hook-form` + `@hookform/resolvers` - Form handling
- `zod` - Runtime validation
- `drizzle-orm` - Database ORM

### Development Dependencies
- `tsx` - TypeScript execution
- `vite` - Frontend dev server and bundler
- `esbuild` - Server bundling
- `@replit/vite-plugin-*` - Replit-specific dev tools (error overlay, cartographer)