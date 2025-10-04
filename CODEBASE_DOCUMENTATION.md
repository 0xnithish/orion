# Orion ERP - Codebase Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture](#architecture)
5. [Key Features](#key-features)
6. [Authentication System](#authentication-system)
7. [State Management](#state-management)
8. [UI Components](#ui-components)
9. [Routing](#routing)
10. [Styling & Theming](#styling--theming)
11. [Development Workflow](#development-workflow)

---

## Project Overview

**Orion** is a modern ERP (Enterprise Resource Planning) application built with Next.js 15. The application features a sophisticated authentication system, collapsible sidebar navigation, theme switching capabilities, and a component-driven architecture using shadcn/ui.

### Key Characteristics
- Server-side rendering with React Server Components (RSC)
- Client-side state persistence with Zustand
- Form validation with React Hook Form and Zod
- Responsive design with mobile-first approach
- Dark/Light theme support

---

## Tech Stack

### Core Framework
- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5** - Type safety

### State Management & Forms
- **Zustand 5.0.8** - Lightweight state management
- **React Hook Form 7.63.0** - Form handling
- **Zod 4.1.11** - Schema validation

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Radix UI-based component library
- **Lucide React** - Icon library
- **class-variance-authority** - CSS variant management

### Build Tools
- **Turbopack** - Next-generation bundler (used for both dev and build)
- **PostCSS** - CSS processing

---

## Project Structure

```
orion/
├── app/                      # Next.js App Router pages
│   ├── auth/                 # Authentication pages
│   │   └── page.tsx         # Login/Signup page
│   ├── chat/                 # Chat feature (placeholder)
│   ├── settings/            # Settings page
│   │   └── page.tsx         # Theme settings
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Dashboard/home page
│   ├── not-found.tsx        # 404 page
│   ├── globals.css          # Global styles and CSS variables
│   └── favicon.ico          # App icon
│
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   │   ├── sidebar.tsx
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── input-otp.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tooltip.tsx
│   │   ├── switch.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   └── sheet.tsx
│   ├── app-sidebar.tsx      # Application sidebar component
│   ├── auth-form.tsx        # Authentication form component
│   └── theme-provider.tsx   # Theme context provider
│
├── hooks/                   # Custom React hooks
│   ├── use-auth.ts          # Authentication hook
│   └── use-auth-store.ts    # Zustand auth store
│
├── lib/                     # Utility functions
│   └── utils.ts             # Helper functions (cn, etc.)
│
├── public/                  # Static assets
│
├── .claude/                 # Claude AI configuration
├── .git/                    # Git repository
├── .next/                   # Next.js build output
├── node_modules/            # Dependencies
│
├── components.json          # shadcn/ui configuration
├── tsconfig.json            # TypeScript configuration
├── next.config.ts           # Next.js configuration
├── postcss.config.mjs       # PostCSS configuration
├── package.json             # Project dependencies
├── pnpm-lock.yaml           # pnpm lock file
├── .gitignore              # Git ignore rules
├── CLAUDE.md               # Claude AI guidelines
└── README.md               # Project readme
```

---

## Architecture

### App Router Architecture
The application uses Next.js 15's App Router with a clear separation between:
- **Server Components** (default) - Pages in `app/` directory
- **Client Components** - Marked with `"use client"` directive

### Component Patterns

#### Server Components
- `app/layout.tsx` - Root layout
- `app/auth/page.tsx` - Auth page wrapper

#### Client Components
- All interactive UI components
- Components using hooks, state, or browser APIs
- Form components with validation

### Data Flow
```
User Action → Client Component → Zustand Store → localStorage
                                      ↓
                                 useAuth Hook
                                      ↓
                              Route Protection
```

---

## Key Features

### 1. Authentication System
- Phone number-based authentication
- OTP verification (demo mode with 000000)
- Multi-country support with flag selection
- Persistent login state with localStorage
- Automatic redirection based on auth status

### 2. Navigation
- Collapsible sidebar with icon-only mode
- User profile dropdown menu
- Quick search button in header
- Settings and logout options

### 3. Theme System
- Light/Dark mode toggle
- Persistent theme preference
- CSS variables for dynamic theming
- Smooth transitions between themes

### 4. Form Validation
- Real-time validation with Zod schemas
- Inline error messages
- Field-level validation
- Disabled submit until form is valid

---

## Authentication System

### Flow Diagram
```
┌─────────────┐
│  Auth Page  │
└──────┬──────┘
       │
       ├─ Step 1: Enter name, country, phone
       │         ↓
       │    Validate with loginSchema
       │         ↓
       │    Generate OTP (000000)
       │         ↓
       ├─ Step 2: Enter OTP
       │         ↓
       │    Validate with otpSchema
       │         ↓
       │    Store in Zustand (authData)
       │         ↓
       │    Persist to localStorage
       │         ↓
       └──► Redirect to Dashboard
```

### Authentication Store
```typescript
// hooks/use-auth-store.ts
interface AuthData {
  name: string
  phone: string
  countryCode: string
  otp: string
  isAuthenticated: boolean
}

interface AuthState {
  authData: AuthData | null
  hasHydrated: boolean
  setAuthData: (data: AuthData) => void
  logout: () => void
  setHydrated: (value: boolean) => void
}
```

### Route Protection
- **Protected Routes**: `/`, `/settings`, `/chat`
- **Public Routes**: `/auth`
- **Protection Method**: `useAuth` hook with automatic redirect

### Authentication Hook
```typescript
// hooks/use-auth.ts
export function useAuth() {
  return {
    logout: () => void
    getAuthData: () => AuthData | null
    isLoading: boolean
    isAuthenticated: boolean
  }
}
```

---

## State Management

### Zustand Store Pattern
The application uses Zustand with localStorage persistence:

```typescript
create<State>()(
  persist(
    (set) => ({ /* state and actions */ }),
    {
      name: 'storage-key',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Hydration callback
      }
    }
  )
)
```

### Hydration Handling
- `hasHydrated` flag prevents hydration mismatches
- Server-side rendering compatibility with memory storage fallback
- Client-only effects after hydration

---

## UI Components

### Component Library Structure
All UI components are from shadcn/ui, built on Radix UI primitives:

| Component | Purpose | File |
|-----------|---------|------|
| Button | Primary interaction | `button.tsx` |
| Input | Text input fields | `input.tsx` |
| Select | Dropdown selection | `select.tsx` |
| Sidebar | Collapsible navigation | `sidebar.tsx` |
| Alert Dialog | Modal dialogs | `alert-dialog.tsx` |
| Dropdown Menu | Context menus | `dropdown-menu.tsx` |
| Input OTP | OTP code input | `input-otp.tsx` |
| Tooltip | Hover information | `tooltip.tsx` |
| Switch | Toggle control | `switch.tsx` |
| Separator | Visual divider | `separator.tsx` |
| Skeleton | Loading placeholder | `skeleton.tsx` |
| Sheet | Slide-out panel | `sheet.tsx` |

### Component Composition Example
```tsx
<SidebarProvider>
  <Sidebar collapsible="icon">
    <SidebarHeader>...</SidebarHeader>
    <SidebarContent>
      <SidebarMenu>
        <SidebarMenuItem>...</SidebarMenuItem>
      </SidebarMenu>
    </SidebarContent>
    <SidebarFooter>...</SidebarFooter>
  </Sidebar>
</SidebarProvider>
```

---

## Routing

### App Router Structure
```
/                  → Dashboard (protected)
/auth              → Login/Signup page
/settings          → Theme settings (protected)
/chat              → Chat feature (protected, placeholder)
```

### Navigation Methods
```typescript
// Programmatic navigation
import { useRouter } from 'next/navigation'
const router = useRouter()
router.push('/path')

// Link component
import Link from 'next/link'
<Link href="/path">Text</Link>
```

### Route Protection Pattern
```typescript
// In page component
const { isLoading, isAuthenticated } = useAuth()

if (isLoading) return <LoadingState />
if (!isAuthenticated) return null // useAuth redirects

return <ProtectedContent />
```

---

## Styling & Theming

### Tailwind Configuration
- **Style**: New York variant
- **Base Color**: Neutral
- **CSS Variables**: Enabled for theming
- **Prefix**: None
- **RSC**: Enabled

### Theme Structure
```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    /* ... more variables */
  }
  
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    /* ... more variables */
  }
}
```

### Theme Provider
```tsx
<ThemeProvider>
  {children}
</ThemeProvider>

// Usage
const { theme, setTheme } = useTheme()
setTheme('dark' | 'light')
```

### Utility Function
```typescript
// lib/utils.ts
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
<div className={cn("base-class", condition && "conditional-class")} />
```

---

## Development Workflow

### Available Scripts
```bash
# Start development server with Turbopack
pnpm dev

# Build for production with Turbopack
pnpm build

# Start production server
pnpm start
```

### Package Manager
**IMPORTANT**: This project uses **pnpm** exclusively. Do not use npm or yarn.

### Path Aliases
```typescript
// Configured in tsconfig.json and components.json
import Component from '@/components/Component'
import { useHook } from '@/hooks/useHook'
import { util } from '@/lib/utils'
import { Button } from '@/components/ui/button'
```

### Type Safety
- Strict TypeScript enabled
- Zod schemas for runtime validation
- Type inference from Zustand stores
- React Hook Form with type-safe validation

### Code Style Guidelines
1. Use `"use client"` directive for interactive components
2. Prefer server components when possible
3. Use absolute imports with `@/` prefix
4. Follow shadcn/ui component patterns
5. Implement proper loading states
6. Handle hydration with `hasHydrated` flag

---

## Best Practices

### Authentication
- Always check `hasHydrated` before redirecting
- Use `isLoading` state for better UX
- Clear sensitive data on logout
- Validate on both client and server

### State Management
- Keep Zustand stores focused and single-purpose
- Use persist middleware for user preferences
- Handle SSR with proper storage checks
- Implement proper TypeScript types

### Forms
- Use Zod for schema validation
- Implement real-time validation
- Show clear error messages
- Disable submit during validation/loading
- Reset forms after successful submission

### Performance
- Leverage server components where possible
- Use Turbopack for fast rebuilds
- Implement proper code splitting
- Optimize images and assets

### Accessibility
- Use semantic HTML
- Implement keyboard navigation
- Provide proper ARIA labels
- Ensure sufficient color contrast

---

## Common Patterns

### Protected Page Template
```tsx
"use client"

import { useAuth } from "@/hooks/use-auth"

export default function ProtectedPage() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return null // Redirect handled by useAuth
  }

  return (
    <div className="p-6">
      {/* Page content */}
    </div>
  )
}
```

### Form with Validation Template
```tsx
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  field: z.string().min(1, "Required")
})

type FormValues = z.infer<typeof schema>

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { field: "" },
    mode: "onChange"
  })

  const onSubmit = form.handleSubmit((values) => {
    // Handle submission
  })

  return <form onSubmit={onSubmit}>{/* Form fields */}</form>
}
```

### Theme Toggle Component
```tsx
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button
      variant={theme === "dark" ? "default" : "outline"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      Toggle Theme
    </Button>
  )
}
```

---

## Future Enhancements

Based on the current structure, potential areas for expansion:

1. **Chat System** - Complete the `/chat` route implementation
2. **Dashboard Analytics** - Add data visualization to home page
3. **User Management** - Implement user roles and permissions
4. **API Integration** - Connect to backend services
5. **Testing** - Add unit and integration tests
6. **CI/CD** - Set up automated deployment pipeline
7. **Documentation** - Expand component documentation
8. **Internationalization** - Add multi-language support

---

## Troubleshooting

### Common Issues

**Hydration Mismatch**
- Ensure `hasHydrated` flag is checked before rendering auth-dependent content
- Use `suppressHydrationWarning` on `<html>` for theme

**Authentication Not Persisting**
- Check localStorage is available
- Verify Zustand persist middleware configuration
- Ensure storage key matches across the app

**Styles Not Applying**
- Check Tailwind CSS configuration
- Verify global styles are imported in layout
- Use `cn()` utility for conditional classes

**Type Errors**
- Run `pnpm build` to check for type issues
- Ensure all imports have proper types
- Check Zod schema matches form types

---

## Additional Resources

### Documentation Links
- [Next.js 15 Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)

### Internal Files
- `CLAUDE.md` - AI coding assistant guidelines
- `README.md` - Quick start guide
- `components.json` - shadcn/ui configuration

---

## Conclusion

Orion is a well-structured ERP application built with modern web technologies. The codebase follows best practices for Next.js 15, implements proper authentication, and provides a solid foundation for building complex enterprise features. The component-driven architecture with shadcn/ui ensures consistency and maintainability across the application.
