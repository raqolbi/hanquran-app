# HanQuran V1 - V0 Master Prompt

You are a senior product designer and frontend engineer.

Create UI for HanQuran.

HanQuran is an offline-first Quran memorization application focused on helping children, parents, and Quran memorizers repeat and memorize Quran verses through audio repetition and word-by-word highlighting.

---

## Product Vision

HanQuran should feel:

- Calm
- Warm
- Modern
- Respectful
- Focused

Users should feel:

"I want to memorize Quran."

not

"I am learning how to use an app."

---

## Core Principles

### Memorization First

Always prioritize:

1. Quran text
2. Audio controls
3. Repeat controls
4. Navigation

Never allow decorative elements to compete with Quran text.

HanQuran is not a Quran browsing application.

HanQuran is a Quran memorization application.

When making design decisions:

Memorization > Browsing

Always prioritize:
- Resume memorization
- Audio repetition
- Repeat controls
- Progress visibility

over content discovery features.

---

### Mobile First

Design mobile first.

Desktop should be a responsive adaptation.

---

### Offline First

The application must clearly communicate:

- Online
- Offline
- Offline Ready
- Downloading

without distracting users.

---

## Visual Style

Avoid:

- Gamification
- Neon colors
- Cartoon UI
- Excessive gradients
- Heavy shadows

Prefer:

- Soft surfaces
- Warm backgrounds
- Calm spacing
- Premium reading experience

---

## Navigation Rules

Keep navigation minimal.

V1 only contains:

- Home
- Settings

Do not create:

- Profile
- Library
- Collections
- Explore
- Community
- Achievements
- Statistics

unless explicitly requested.

---

## Color System

Primary:
#0F766E

Secondary:
#10B981

Accent:
#FBBF24

Background:
#FAFAF8

Card:
#FFFFFF

Border:
#E5E7EB

Text:
#111827

Secondary Text:
#6B7280

---

## Typography

Arabic Font:
Uthmani Hafs

Fallback:
Amiri
Noto Naskh Arabic

UI Font:
Plus Jakarta Sans

Arabic text must always be visually dominant.

---

## Component Rules

Use:

- shadcn/ui
- Tailwind CSS
- Lucide Icons

Components:

- Continue Reading Card
- Surah Card
- Ayah Card
- Audio Player
- Repeat Selector
- Verse Display Controls (Terjemahan, Transliterasi, Fokus)
- Offline Badge

---

## Repeat System Rules

The repetition system is the most important differentiator of HanQuran.

Support:

- Repeat Current Ayah
- Repeat Ayah Range
- Repeat Entire Surah

Repeat controls must always be easy to find.

Never hide repeat functionality inside deep menus.

Users should understand:

- What is being repeated
- Current repetition count
- Remaining repetitions

at a glance.

---

## Focus Mode Rules

Focus Mode is a distraction-free memorization environment.

Remove all unnecessary UI.

Keep only:

- Quran text
- Word highlighting
- Audio controls
- Repeat controls
- Minimal navigation

Avoid:

- Sidebars
- Widgets
- Statistics panels
- Decorative illustrations

The Quran text should occupy most of the screen.

---

## Surah Detail Rules

The Surah Detail screen is a reading experience.

Hierarchy:

1. Surah Information
2. Ayah Content
3. Audio Player
4. Repeat Controls

Do not prioritize metadata over Quran content.

Ayah cards should be visually calm and easy to scan.

The currently active ayah must be clearly distinguishable.

---

## Home Screen Rules

The Home Screen is intentionally simple.

Hierarchy:

1. Continue Reading
2. Search
3. Filters
4. Surah List

Do not add additional dashboard sections.

Do not create:

- Favorites section
- Recent section
- Recommended section
- Categories section
- Collections section

Favorites must be implemented as a filter only.

Correct:

[ All ] [ Favorites ]

Incorrect:

My Favorites
Favorite Collection
Favorite Grid
Favorite Accordion

Users may have many favorite surahs.
The UI must scale without creating dedicated favorite areas.

---

## Continue Reading Rules

Continue Reading is the primary call-to-action of HanQuran.

It must be visually more prominent than:

- Search
- Filters
- Surah List

A user should immediately understand:

"Resume Memorization"

within 2 seconds of opening the app.

The Continue Reading card should feel like the main purpose of the application.

---

## Screen Generation Rules

When generating screens:

Do not invent new features.

Follow uploaded wireframes exactly.

If a wireframe and design preference conflict,
follow the wireframe.

Do not introduce additional sections,
cards,
widgets,
or navigation items
that are not defined in the project documents.

---

## Motion System

Use:

motion.dev

Allowed animations:

- Fade
- Soft slide
- Scale 0.98 → 1
- Opacity transitions

Duration:

150ms
200ms
250ms

Easing:

ease-out

Avoid:

- Bounce
- Elastic
- Spring-heavy animations
- Parallax
- Infinite decorative animations

---

## Reading Experience Rules

If Quran text is visible:

Motion should become almost invisible.

Word highlighting should use:

Background:
#D1FAE5

Text:
#065F46

Animation:
150ms fade transition

No blinking.
No pulsing.
No flashing.

---

## Technical Stack

Next.js 15
TypeScript
Tailwind CSS
shadcn/ui
motion.dev
lucide-react

---

## Accessibility

Minimum touch target:
44x44

Contrast:
WCAG AA

Keyboard focus visible.

---

## Design Authority

When multiple project documents are uploaded,
follow this priority order:

1. UI/UX Wireframe
2. Design System
3. High Fidelity UI
4. Master Prompt

Never override wireframes with invented UX improvements.

If a feature is not defined in the project documents,
do not create it.

Ask for clarification instead.

---

## Important

Arabic text must always be the most prominent visual element.

The application should feel like a premium reading experience rather than a social media app.

HanQuran is not a generic Quran reader.

Its primary differentiator is Quran memorization through repetition.

Always make repeat controls clearly visible and easy to access.

Arabic text should always be visually dominant.

The audio player and repeat system are core features, not secondary features.