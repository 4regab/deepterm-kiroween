---
inclusion: always
---

# Project Structure

## Directory Layout

```
src/
├── app/                      # Next.js App Router (routes & API)
│   ├── (dashboard)/          # Protected routes (auth required)
│   │   ├── materials/[id]/   # Study modes: flashcards, learn, match, practice
│   │   └── layout.tsx        # Dashboard layout with Sidebar
│   ├── api/                  # API routes (generate-cards, generate-reviewer, share)
│   ├── auth/callback/        # OAuth callback
│   └── share/[code]/         # Public share pages
├── components/               # React components (organized by feature)
├── config/                   # Configuration (supabase/, gemini.ts)
├── lib/
│   ├── schemas/              # Zod validation schemas (one per domain)
│   ├── stores/               # Zustand stores (one per domain)
│   └── supabase/             # SQL schema files
├── services/                 # Business logic (geminiClient, rateLimit, activity)
├── tests/                    # Vitest tests
├── utils/                    # Pure utility functions
└── styles/                   # Global CSS
```

## Architecture Conventions

### File Placement
- Routes: `src/app/` following Next.js App Router conventions
- Reusable components: `src/components/{FeatureName}/`
- Domain stores: `src/lib/stores/{domain}Store.ts`
- Validation schemas: `src/lib/schemas/{domain}.ts`
- Business logic: `src/services/`
- Pure utilities: `src/utils/`

### Zustand Stores
Each store in `src/lib/stores/` manages one domain:
- `materialsStore` - Study materials CRUD
- `profileStore` - User profile data
- `achievementsStore` - Achievement tracking
- `pomodoroStore` - Timer state
- `xpStore` - XP and leveling
- `themeStore` - Theme toggle (normal/spooky)
- `uiStore` - UI state (sidebar, modals)

### API Route Pattern
```typescript
// src/app/api/{feature}/route.ts
export async function POST(request: NextRequest) {
  // 1. Parse and validate with Zod schema
  // 2. Check rate limits for AI operations
  // 3. Execute business logic
  // 4. Return NextResponse (sanitize errors)
}
```

### Component Pattern
- Use `"use client"` only when necessary (interactivity, hooks)
- Prefer Server Components for data fetching
- Dynamic import heavy components: `dynamic(() => import('./Heavy'), { ssr: false })`
- Access theme via `useThemeStore()`

### Import Aliases
Use `@/*` for all imports from `src/`:
```typescript
import { useProfileStore } from '@/lib/stores/profileStore'
import { MaterialSchema } from '@/lib/schemas/materials'
```
