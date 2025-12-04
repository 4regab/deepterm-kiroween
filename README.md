
# Deepterm

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

A free, open-source alternative to Quizlet and Gizmo. It transforms PDFs and study materials into flashcards and reviewer notes. Built with spaced repetition at its core, cards progress through stages (new, learning, review, mastered) to optimize long-term retention. Unlike paid alternatives, DeepTerm combines AI generation with rich productivity features including an integrated Pomodoro timer, task reminders, ambient sounds, and gamified learning through XP progression, achievements, and study streaks - all completely free.
<img width="1797" height="947" alt="image" src="https://github.com/user-attachments/assets/61fbd873-a6d0-43c8-9c54-fd01190dc8a8" />

**[Live Demo](https://deepterm.me)**

## Features

### Materials Creation

- **Flashcard Maker** - Upload PDF or paste text to automatically extract key terms and definitions using AI. Supports spaced repetition with card status tracking (new, learning, review, mastered).

- **Reviewer Maker** - Transform dense content into organized, categorized study materials with three extraction modes:
  - Full Mode: Complete definitions with examples and context
  - Sentence Mode: Concise one-sentence summaries
  - Keywords Mode: Key phrases and concepts only

### Study Modes

- **Flashcards** - Interactive flashcard review with flip animations
- **Learn Mode** - Adaptive learning with progress tracking
- **Match Game** - Memory matching game for term-definition pairs
- **Practice Test** - Mixed question types based on card mastery level

### Material Management

- **Edit Terms** - Add, edit, and delete terms/definitions directly in the app
- **Category Management** - Organize reviewer terms into categories with color coding
- **Delete Categories** - Remove entire categories with all associated terms
- **Drag & Drop Reorder** - Reorder flashcard terms with drag and drop

### Theme System



- **Normal Mode** - Clean, light interface with warm tones
- **Spooky Mode** - Dark purple Halloween theme featuring:
  - **Flashlight Effect** - Immersive dark study mode where the screen is pitch black and only the area around your cursor/finger is illuminated, like studying with a flashlight in the dark
  - **Halloween** inspired UI text throughout the app

### Export & Sharing

- **PDF Export** - Export reviewers and flashcards to compact two-column PDF format
- **DOCX Export** - Export to Microsoft Word format with proper formatting
- **Share Links** - Generate shareable links with custom codes for materials
- **Copy to Library** - Allow others to copy shared materials to their account

### Productivity Features

- **Pomodoro Timer** - Customizable focus timer with:
  - Configurable work/break durations (25/5/15 min defaults)
  - Session tracking and streak counting
  - Task list with reminder notifications
  - Background ambient sounds (rain, cafe, nature)
  - Custom background image upload
  - Fullscreen focus mode
  - Global notification system for phase transitions


- **Achievement System** - Gamified progress with unlockable achievements
- **XP & Leveling** - Experience points system with level progression and rank titles (Novice to Grandmaster)

### Account & Settings

- **Google OAuth** - Sign in with Google account
- **Daily Rate Limits** - 10 AI generations per day per user (with unlimited user whitelist support)
- **Help Center** - In-app documentation and support
- **Account Deletion** - Self-service account deletion

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript 
- **Styling**: Tailwind CSS 
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth (Google OAuth)
- **LLM**: Google Gemini 2.5 Flash-Lite
- **State Management**: Zustand 5
- **Animations**: Framer Motion, GSAP
- **PDF Generation**: jsPDF
- **DOCX Generation**: docx
- **Validation**: Zod 4
- **Testing**: Vitest 4 with fast-check for property-based testing
- **Deployment**: Vercel

### Security Features

- Row Level Security (RLS) on all tables
- Atomic rate limiting with database functions
- Input validation with Zod schemas
- XP bounds checking (1-100 per operation)
- Secure share access via RPC functions
- Content Security Policy headers
- HTTPS enforcement with HSTS

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Google Gemini API key(s)

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Support for multiple API keys with rotation
GEMINI_API_KEY_1=your_gemini_api_key_1
GEMINI_API_KEY_2=your_gemini_api_key_2
GEMINI_API_KEY_3=your_gemini_api_key_3
GEMINI_API_KEY_4=your_gemini_api_key_4
GEMINI_API_KEY_5=your_gemini_api_key_5
```

### Google Cloud Setup (OAuth)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > OAuth consent screen**
   - Choose "External" user type
   - Fill in app name, user support email, and developer contact
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if in testing mode
4. Navigate to **APIs & Services > Credentials**
   - Click **Create Credentials > OAuth client ID**
   - Select "Web application"
   - Add authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**

### Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run `schema.sql` and `supabase-rls-policies.sql` in the SQL Editor (Dashboard > SQL Editor)
3. Configure Google OAuth:
   - Go to **Authentication > Providers > Google**
   - Enable Google provider
   - Paste your Google Client ID and Client Secret
   - Save changes

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests with Vitest |

## Rate Limiting

AI generation is rate-limited to 10 requests per user per day to manage API costs. The limit resets at midnight UTC. Users in the `unlimited_users` table bypass this limit. The system uses atomic check-and-increment operations to prevent race conditions.


## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`, `npm run build`, `npx eslint src/`
5. Submit a pull request

#
Submitted for the [Kiroween Hackathon](https://kiroween.devpost.com/) by [Kiro](https://kiro.dev/).
