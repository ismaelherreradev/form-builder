---
inclusion: always
---

# Technology Stack & Development Guidelines

## Core Technologies
- **Next.js 15** with App Router - Use server components by default, client components only when needed
- **React 19** - Leverage latest features like `use()` hook and concurrent features
- **TypeScript** - Strict mode enabled, use proper typing for all functions and components
- **SQLite + Drizzle ORM** - Type-safe database operations, use prepared statements for performance

## Authentication & Security
- **Better Auth** - 7-day sessions with 1-day refresh, email/password only
- Route protection via middleware - `(auth)` routes public, `(dashboard)` protected
- Use `@/lib/session` utilities for server-side auth checks

## UI Development Standards
- **shadcn/ui (New York style)** - Use existing components, extend via composition not modification
- **Tailwind CSS 4** - Utility-first approach, use design tokens consistently
- **Dark/light mode** - All components must support theme switching via `next-themes`
- **Responsive design** - Mobile-first approach, test on all breakpoints

## Form Builder Architecture
- **React Hook Form + Zod** - Form validation and state management
- **@dnd-kit** - Drag and drop with accessibility support
- **Theme system** - Custom theme provider for form styling (`FormThemeProvider`)
- Use server actions for form submissions and database operations

## Code Quality Requirements
- **Biome** for linting/formatting - Run `npm run check:write` before commits
- **TypeScript strict mode** - No `any` types, proper error handling
- **Testing** - Vitest for unit tests, Playwright for E2E (when implementing tests)
- Import aliases - Use `@/` for all internal imports

## Database Patterns
- **Drizzle schema** - PascalCase tables, camelCase columns
- **Migrations** - Generate via `npm run db:generate`, never edit manually
- **Queries** - Use type-safe Drizzle queries, prefer prepared statements

## Component Organization
- `components/ui/` - shadcn/ui primitives only
- `components/form-builder/` - Form builder specific logic
- `components/providers/` - React context providers
- Feature components at root level with descriptive names

## Performance Guidelines
- Server components for data fetching
- Client components only for interactivity
- Use React Suspense for loading states
- Optimize images with Next.js Image component
- Database queries should use indexes and prepared statements

## Development Workflow
```bash
npm run dev          # Development server
npm run db:push      # Push schema changes
npm run db:studio    # Database GUI
npm run check:write  # Fix all code quality issues
```
