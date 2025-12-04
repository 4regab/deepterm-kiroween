---
inclusion: always
---

# Tech Stack Reference

## Core Technologies
- Next.js 16 (App Router) + React 19 (React Compiler enabled)
- TypeScript 5 (strict mode) - always use strict typing
- Tailwind CSS 4 - mobile-first, utility classes only
- Zustand 5 - client state in `src/lib/stores/`
- Zod 4 - validate all external data at boundaries

## Database & Auth
- Supabase PostgreSQL with Row Level Security (RLS)
- Supabase Auth with Google OAuth
- Always respect RLS policies; never bypass security

## AI Integration
- Google Gemini 2.5 Flash-Lite via `@google/genai`
- Multi-key rotation (`GEMINI_API_KEY_1` through `GEMINI_API_KEY_5`)
- Always check rate limits before AI operations

## Animation Libraries
- Framer Motion - React component animations
- GSAP - complex timeline animations
- Three.js + React Three Fiber - 3D effects

## Testing
- Vitest 4 for unit tests
- fast-check for property-based testing
- Run `npm run test` (single run) or `npm run test:watch`

## Development Guidelines

### TypeScript
- Prefer `interface` over `type` for object shapes
- Use `unknown` over `any`; narrow types explicitly
- Export types alongside implementations

### React Patterns
- Favor Server Components; use `"use client"` only when required
- Dynamic import heavy components: `dynamic(() => import('./X'), { ssr: false })`
- Wrap client components in Suspense with fallback

### Styling
- Use Tailwind utilities; avoid custom CSS
- Mobile-first breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- No inline styles

### State Management
- One Zustand store per domain
- Keep stores in `src/lib/stores/{domain}Store.ts`
- Validate store inputs with Zod schemas

### Path Alias
- Use `@/*` for all imports from `src/`

## Commands
```bash
npm run dev      # Dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
npm run test     # Run tests
```

## Environment Variables
Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY_1` through `GEMINI_API_KEY_5`

## API Endpoints

### POST /api/generate-cards
Generate flashcards from PDF or text content.

- **Input**: FormData with `file` (PDF) or `textContent` (string)
- **Output**: `{ cards: [{term, definition}], remaining: number }`
- **Rate Limited**: Yes (10/day)

### POST /api/generate-reviewer
Generate categorized reviewer content from PDF or text.

- **Input**: FormData with `file`, `textContent`, and `extractionMode` (full/sentence/keywords)
- **Output**: `{ title, extractionMode, categories: [{name, color, terms}], remaining }`
- **Rate Limited**: Yes (10/day)

### Share API (/api/share)
- **GET**: Get share info for a material
- **POST**: Create or update share link
- **PATCH**: Toggle active status or change code
- **DELETE**: Remove share