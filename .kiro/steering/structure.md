# Project Structure

## Root Configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration with path aliases (`@/*`)
- `next.config.mjs` - Next.js configuration
- `biome.json` - Code formatting and linting rules
- `components.json` - shadcn/ui configuration
- `drizzle.config.ts` - Database configuration
- `middleware.ts` - Next.js middleware for route protection

## App Directory (Next.js App Router)
```
app/
├── (auth)/                 # Auth route group
│   ├── layout.tsx         # Auth-specific layout
│   ├── sign-in/[[...sign-in]]/
│   └── sign-up/[[...sign-up]]/
├── (dashboard)/           # Protected dashboard routes
│   ├── layout.tsx        # Dashboard layout with nav
│   ├── page.tsx          # Dashboard home
│   ├── builder/          # Form builder interface
│   └── forms/            # Form management
│       ├── [id]/         # Individual form pages
│       └── page.tsx      # Forms list
├── api/                  # API routes
│   └── auth/[...all]/    # Better Auth API handler
├── submit/[formUrl]/     # Public form submission
├── layout.tsx            # Root layout
└── globals.css           # Global styles
```

## Component Organization
```
components/
├── ui/                   # shadcn/ui components (reusable primitives)
├── form-builder/         # Form builder specific components
├── providers/            # React context providers
└── [feature-components]  # Feature-specific components
```

## Library Code
```
lib/
├── auth.ts              # Better Auth configuration
├── auth-client.ts       # Client-side auth utilities
├── auth-schema.ts       # Auth database schema
├── db.ts                # Database connection
├── schema.ts            # Main database schema
├── session.ts           # Session management utilities
└── utils.ts             # Shared utilities (cn, etc.)
```

## Database
```
drizzle/                 # Generated migrations
├── [timestamp]_*.sql    # Migration files
└── meta/                # Migration metadata
sqlite.db                # SQLite database file
```

## Schemas & Actions
```
schemas/                 # Zod validation schemas
actions/                 # Server actions
```

## Naming Conventions

### Files & Folders
- **kebab-case** for file names (`form-card.tsx`)
- **PascalCase** for React components (`FormCard`)
- **camelCase** for utilities and functions
- **Route groups** use parentheses `(auth)`, `(dashboard)`
- **Dynamic routes** use brackets `[id]`, `[formUrl]`
- **Catch-all routes** use `[[...slug]]`

### Database
- **PascalCase** for table names (`Form`, `FormSubmissions`)
- **camelCase** for column names (`userId`, `createdAt`)
- Foreign keys reference with `Id` suffix (`formId` → `forms.id`)

## Import Patterns
- Use `@/` path alias for all internal imports
- Group imports: external libraries first, then internal modules
- Prefer named exports over default exports for utilities

## Route Protection
- `(auth)` routes are public (sign-in, sign-up)
- `(dashboard)` routes require authentication
- `submit/[formUrl]` routes are public for form submissions
- Middleware handles route protection automatically

## State Management
- **Server State**: Database queries via Drizzle ORM
- **Client State**: React Hook Form for forms, React Context for global state
- **Form Builder**: Custom context provider for drag-and-drop state