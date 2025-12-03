# DeepTerm - Tech Stack

## Framework & Runtime
- **Next.js 16** with App Router
- **React 19** with React Compiler enabled
- **TypeScript 5** (strict mode)

## Styling
- **Tailwind CSS 4** for utility-first styling
- Mobile-first responsive design

## Database & Auth
- **Supabase** (PostgreSQL) with Row Level Security (RLS)
- **Supabase Auth** with Google OAuth

## State Management
- **Zustand 5** for client-side state (stores in `src/lib/stores/`)

## AI Integration
- **Google Gemini 2.5 Flash-Lite** via `@google/genai`
- Multi-key rotation for API resilience

## Validation
- **Zod 4** for runtime schema validation

## Animations
- **Framer Motion** for React animations
- **GSAP** for complex animations
- **Three.js** with React Three Fiber for 3D effects

## Testing
- **Vitest 4** for unit testing
- **fast-check** for property-based testing

## Deployment
- **Vercel** for hosting

## Common Commands

```bash
# Development
npm run dev          # Start dev server (localhost:3000)

# Build & Production
npm run build        # Production build
npm run start        # Start production server

# Quality
npm run lint         # Run ESLint
npm run test         # Run tests (single run)
npm run test:watch   # Run tests in watch mode
```

## Path Aliases
- `@/*` maps to `./src/*` (configured in tsconfig.json)

## Environment Variables
Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY_1` through `GEMINI_API_KEY_5` (supports rotation)
