---
inclusion: always
---

# DeepTerm - Product Context

AI-powered study platform transforming PDFs/text into interactive learning materials.

## Product Domain

- **Primary Function**: Convert uploaded content (PDF/text) into flashcards and reviewers via Google Gemini AI
- **Study Modes**: Flashcards, Learn, Match Game, Practice Tests
- **Gamification**: XP system, achievements, level progression
- **Productivity**: Pomodoro timer with task integration
- **Sharing**: Shareable links for materials
- **Export**: PDF/DOCX export capability

## Business Rules

- AI generation rate limit: 10 requests/day per user
- Unlimited users maintained via whitelist for premium access
- All AI operations must check rate limits before processing

## User Context

Target: Students and learners converting study materials into active learning tools.

## AI Assistant Guidelines

When working on this codebase:
- Preserve rate limiting logic in AI generation endpoints
- Maintain XP/achievement triggers when modifying study flows
- Keep study mode interfaces consistent across Flashcards, Learn, Match, Practice
- Respect the gamification hooks (XP awards, achievement unlocks)
- Ensure sharing functionality generates valid, accessible links
- Export features must produce properly formatted PDF/DOCX output
