# DeepTerm - Project Structure

Primary project location: `deepterm-kiroween/`

```
src/
├── app/                      # Next.js App Router
│   ├── (dashboard)/          # Protected routes (requires auth)
│   │   ├── account/          # User account settings
│   │   ├── achievements/     # Achievements page
│   │   ├── dashboard/        # Main dashboard
│   │   ├── materials/        # Materials CRUD & study modes
│   │   │   ├── create/       # Create new material
│   │   │   └── [id]/         # Material detail & study modes
│   │   │       ├── flashcards/
│   │   │       ├── learn/
│   │   │       ├── match/
│   │   │       └── practice/
│   │   ├── pomodoro/         # Pomodoro timer
│   │   └── layout.tsx        # Dashboard layout with sidebar
│   ├── api/                  # API routes
│   │   ├── generate-cards/   # AI flashcard generation
│   │   ├── generate-reviewer/# AI reviewer generation
│   │   └── share/            # Sharing endpoints
│   ├── auth/callback/        # OAuth callback handler
│   ├── share/[code]/         # Public share pages
│   └── page.tsx              # Landing page
│
├── components/               # React components
│   ├── Dashboard/            # Dashboard widgets (StatsBar, Calendar, etc.)
│   ├── Header/               # Header component
│   ├── Sidebar/              # Navigation sidebar
│   └── SpookyTheme/          # Theme system (normal/spooky modes)
│
├── config/                   # Configuration
│   ├── supabase/             # Supabase client setup (client.ts, server.ts)
│   └── gemini.ts             # Gemini AI config
│
├── lib/                      # Core libraries
│   ├── schemas/              # Zod validation schemas
│   ├── stores/               # Zustand state stores
│   └── supabase/             # Database schema SQL files
│
├── services/                 # Business logic
│   ├── geminiClient.ts       # AI client with key rotation
│   ├── rateLimit.ts          # Rate limiting logic
│   └── activity.ts           # Activity tracking
│
├── tests/                    # Vitest test files
│   └── api/                  # API route tests
│
├── utils/                    # Utility functions
└── styles/                   # Global CSS (globals.css)
```

## Key Patterns

### Stores (Zustand)
Located in `src/lib/stores/` - each store manages a domain:
- `materialsStore` - Study materials
- `profileStore` - User profile
- `achievementsStore` - Achievements
- `pomodoroStore` - Timer state
- `xpStore` - XP/leveling
- `themeStore` - Theme (normal/spooky)
- `uiStore` - UI state (sidebar, menus)

### Schemas (Zod)
Located in `src/lib/schemas/` - validation schemas for each domain

### API Routes
- Use `NextRequest`/`NextResponse`
- Validate input with Zod
- Check rate limits before AI operations
- Return sanitized errors (no internal details)

### Components
- Client components use `"use client"` directive
- Dynamic imports for heavy components (Sidebar)
- Theme-aware styling via `useThemeStore`
