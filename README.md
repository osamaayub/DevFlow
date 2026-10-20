# DevFlow

<div align="center">

![DevFlow Logo](https://img.shields.io/badge/DevFlow-Community%20Q%2FA-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-🚧%20In%20Development-orange?style=for-the-badge)

A modern, community-driven **Q&A platform for developers** — reimagined with the latest web technologies.

[![Next.js](https://img.shields.io/badge/Next.js%2016-000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React%2019-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Documentation](#) • [Report Bug](https://github.com/osamaayub/DevFlow/issues) • [Request Feature](https://github.com/osamaayub/DevFlow/discussions)

</div>

> 🚀 **Project Status:** Core functionality is in place and the project is in beta/stabilization. Recent work added a jobs board, answer editing and deletion, and moved the app to Next.js Cache Components with cached data and instant navigations.


---

## ✨ Features

<table>
<tr>
<td width="50%">

### 💬 Ask & Answer
Post questions, write detailed answers, and help others grow together.

### 🔍 Powerful Search
Full-text search with intelligent tag and category filtering.

### 🏷️ Tagging System
Organize content with technology tags (React, JavaScript, TypeScript, etc.).

### ⭐ Saved Questions
Save or remove questions and browse saved questions in your collection.

### 👍 Voting
Upvote or downvote questions and answers with optimistic UI updates.

### 🎯 Personalized Recommendations
Signed-in users get recommended questions based on their interaction history and preferred tags. Questions they have already interacted with are excluded.

</td>
<td width="50%">

### 🔐 Authentication
Sign in with Google, GitHub, or email via NextAuth.

### 🌓 Dark / Light Theme
Seamless theme switching for comfortable viewing.

### 📱 Responsive Design
Optimized for desktop, tablet, and mobile devices.

### 👥 Community
Browse members, filter by reputation or popularity, and view each member's questions.

### 👤 User Profiles
View responsive profiles with bio, location, portfolio, activity stats, paginated questions and answers, and upvote/downvote controls on answers. Owners can edit and delete their questions and answers from the profile, with a confirmation dialog before deleting; users can also edit their profile details.

### 🔥 Hot Network & Popular Tags
Right sidebar highlights top-voted questions and popular tags. User profiles show up to six tags used on the user's questions.

</td>
</tr>
<tr>
<td colspan="2">

### ✍️ Rich Editor
Markdown editor (MDXEditor, loaded client-side only) for questions and answers, with syntax-highlighted code blocks rendered via Bright.

### 🧭 Filters & Pagination
Shared filter components and page-number pagination across home, tags, tag details, collection, community, profile, jobs, and answers. Question lists show 3 per page.

### 📊 Structured Logging
Request and error logging with Pino for debugging and monitoring.

### 🤖 AI-Powered Answers
Generate intelligent answers using OpenAI integration.

### 💼 Jobs Board
Browse, search and filter jobs, then apply, save or share them. Posters can create, edit and delete their jobs (with company logo upload) and review applicants.

### ⚡ Caching & Instant Navigation
Cache Components and Partial Prefetching serve a static shell instantly while page data streams in. Shared lists are cached and invalidated as soon as questions, answers, votes or views change.

</td>
</tr>
</table>

---

## 🔄 Recent Updates

- **Jobs:** job board with search, filters and salary sorting; apply, save and share; posters can create, edit and delete jobs and manage applicants.
- **Answers:** edit and delete your own answers from the profile Answers tab, with a dedicated answer edit page.
- **Deletes:** shared confirmation dialog (shadcn AlertDialog) for deleting questions and answers; deletes run in MongoDB transactions and remove related votes.
- **Caching:** enabled Next.js Cache Components and Partial Prefetching; question and tag lists are cached with tag-based invalidation, and the session is read once per request.
- **Queries:** escaped search input, bounded pagination input, atomic view and answer counters, and new indexes for feeds, votes, saved questions and tag links.
- **Recommendations:** the home feed's Recommended filter now uses question interactions and preferred tags, removes duplicate tags, excludes previously interacted questions, and falls back to popular unseen questions.
- **Authentication:** personalized recommendations are used only for signed-in users; logged-out users continue to receive the public question feed.
- **Google sign-in:** fewer database round trips during OAuth sign-in and a unique index on accounts.
- **API:** `POST /api/questions` for creating questions (used by the Thunder Client collection).
- **Lists:** page-number pagination everywhere, with 3 questions per page.

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|:---:|:---|
| **Frontend** | [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions) • [React 19](https://react.dev) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [MongoDB](https://www.mongodb.com/) via [Mongoose 8](https://mongoosejs.com/) |
| **Auth** | [NextAuth.js v5](https://authjs.dev/) (Google, GitHub, Credentials) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) • [shadcn/ui](https://ui.shadcn.com/) • [Radix UI](https://www.radix-ui.com/) • [Lucide](https://lucide.dev/) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) • [Zod](https://zod.dev/) |
| **Editor** | [MDX Editor](https://mdxeditor.dev/) • [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) • [Bright](https://bright.codehike.org/) |
| **AI** | [OpenAI](https://openai.com/) via [Vercel AI SDK](https://sdk.vercel.ai/) |
| **Logging** | [Pino](https://getpino.io/) |

</div>

---

## 🚀 Quick Start

### Prerequisites

```bash
✓ Node.js ≥ 22.13
✓ Yarn (via Corepack: `corepack enable`)
✓ MongoDB (local or Atlas)
```

### Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/osamaayub/DevFlow.git
cd DevFlow

# 2️⃣ Install dependencies (also applies patches/ via patch-package)
yarn install

# 3️⃣ Create a .env.local file in the project root
#    and add the variables listed below

# 4️⃣ At minimum set:
# MONGODB_URI, AUTH_SECRET (OAuth and OpenAI keys are optional)

# 5️⃣ Start development server
yarn dev

# 6️⃣ Open http://localhost:3000 in your browser 🎉
```

---

## 🔧 Environment Variables

> 📝 **Note:** Env files are loaded per environment and are git-ignored for security.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/devflow` |
| `AUTH_SECRET` | NextAuth encryption key | Generate with: `npx auth secret` |
| `OPENAI_API_KEY` | OpenAI API key for AI answers | Get from [OpenAI Platform](https://platform.openai.com/) |

### OAuth Providers (Optional)

| Variable | Provider | How to Get |
|----------|----------|-----------|
| `AUTH_GITHUB_ID` | GitHub OAuth | [GitHub OAuth Settings](https://github.com/settings/developers) |
| `AUTH_GITHUB_SECRET` | GitHub OAuth | [GitHub OAuth Settings](https://github.com/settings/developers) |
| `AUTH_GOOGLE_ID` | Google OAuth | [Google Cloud Console](https://console.cloud.google.com/) |
| `AUTH_GOOGLE_SECRET` | Google OAuth | [Google Cloud Console](https://console.cloud.google.com/) |

### Optional Variables

| Variable | Default | Values |
|----------|---------|--------|
| `LOG_LEVEL` | `debug` (dev) / `info` (prod) | `debug`, `info`, `warn`, `error` |
| `NEXTAUTH_URL` | Auto-detected (`trustHost`) | Your site URL, e.g. `http://localhost:3000` |
| `NEXT_PUBLIC_API_BASE_URL` | `https://$VERCEL_URL` on Vercel, otherwise localhost | Base URL used by the API client in `lib/api.ts` |

---

## 📋 Available Scripts

```bash
# Development
yarn dev          # Start dev server (webpack)

# Production
yarn build        # Create optimized production build
yarn start        # Run production server

# Code Quality
yarn lint         # Run ESLint checks
```

---

## 🏗️ Development Status

### ✅ Completed
- [x] Project setup with Next.js 16 & TypeScript
- [x] MongoDB & Mongoose integration with multiple models
- [x] NextAuth.js authentication (Google, GitHub, Email/Password)
- [x] Complete database models (Questions, Answers, Users, Tags, Accounts, Collections, Interactive, Votes, QuestionView, TagQuestion)
- [x] Server actions for CRUD operations (questions, answers, tags, auth)
- [x] Tailwind CSS & component styling with shadcn/ui
- [x] Dark/Light theme support with context provider
- [x] Rich text editor with MDX support
- [x] Tag management system with tag-question relationships
- [x] Search functionality with filtering
- [x] Pagination system
- [x] Error handling with custom error handler
- [x] Validation schemas with Zod
- [x] AI Answer API endpoint with OpenAI integration
- [x] API client functions and centralized route constants
- [x] Core UI pages (home, sign-in, sign-up, ask-question, question details, tags, collections)
- [x] React components (forms, cards, navigation, editor, search, filters, shared utilities)
- [x] User authentication flow (sign up, sign in, OAuth)
- [x] Question creation and editing
- [x] Question edit/delete flow from the profile activity cards with proper ownership checks
- [x] Delete confirmation and toast success/error feedback for question removal
- [x] Profile activity refactor into reusable UI components and a dedicated state/action hook
- [x] Separate paginated profile question and answer server actions
- [x] Optimistic upvote/downvote controls and current-user vote state on profile answer cards
- [x] Profile query indexes for sorted questions, sorted answers, and author-tag aggregation
- [x] Bounded profile tag-name lookup without an aggregation `$lookup`
- [x] Save and remove questions with a stateful saved-star indicator
- [x] Collection page listing the signed-in user's saved questions
- [x] Answer creation
- [x] Question view tracking
- [x] Responsive design across implemented pages
- [x] Local search bar with filtering
- [x] Navigation sidebar and mobile navigation
- [x] Theme toggle component
- [x] User avatar components
- [x] Relative time display
- [x] Toast notifications with Sonner
- [x] Form validation with React Hook Form
- [x] Database connection management
- [x] Structured logging with Pino
- [x] API route handlers for users, accounts, auth, and AI
- [x] OAuth callback handling and user account creation
- [x] Password hashing with bcrypt
- [x] Username generation for OAuth users
- [x] Session management and JWT callbacks
- [x] MongoDB transaction support for complex operations
- [x] Tag processing and helper functions
- [x] Question filtering (newest, unanswered, popular)
- [x] Personalized question recommendations from user interactions and preferred tags
- [x] Exclude previously interacted questions from recommendations
- [x] Deduplicate tags in recommendation results
- [x] Interaction tracking with reputation updates for posts, votes, bookmarks, views and edits
- [x] Badge system and gamification with bronze, silver and gold profile badges
- [x] URL utilities and helpers
- [x] AI Answer UI integration (API implemented, UI Implemented)
- [x] Vote system (upvotes/downvotes) for questions and answers with optimistic updates
- [x] Home filters (newest, recommended, frequent, unanswered)
- [x] Shared filter component for tags, collection, community, and answers
- [x] Pagination for questions, tags, tag details, answers, collection, and community
- [x] Tag details page
- [x] Community page with search, filters, and member details page
- [x] User profiles with editable profile details, activity tabs, statistics, and per-tab question/answer pagination
- [x] Right sidebar with hot questions and popular tags
- [x] Back button across pages
- [x] MDX editor loaded client-side only (fixes "This page couldn't load" on ask-question and question details)
- [x] CI workflow (lint, type-check, build) and Docker image publishing to GHCR
- [x] Jobs board: listing, search, filters, details, apply, save, share
- [x] Job posting with logo upload, plus edit, delete and applicant management for posters
- [x] Answer editing and deletion from the profile Answers tab
- [x] Shared confirmation dialog for question and answer deletion
- [x] Next.js Cache Components and Partial Prefetching with per-route loading states
- [x] Cached question and tag lists with tag-based invalidation
- [x] `POST /api/questions` endpoint for creating questions

### 🚧 In Progress
- [ ] Final polish and edge-case validation for remaining UI flows
- [ ] Securing the users and accounts REST endpoints

### 📋 Planned
- [ ] User management actions
- [ ] Live demo deployment
- [ ] Admin dashboard
- [ ] Real-time notifications
- [ ] Advanced analytics and reporting
- [ ] Community features (comments, discussions)
- [ ] API rate limiting
- [ ] Additional OAuth providers
- [ ] Enhanced search algorithms
- [ ] Performance optimizations
- [ ] Additional unit and integration tests

---

## 📁 Project Structure

The project has no `src` folder: `app/` and the other folders sit at the project root. `app/` holds only routes (pages, layouts, loading states and API handlers), and each route delegates to a feature folder.

```
DevFlow/
├── app/                                  # Routes only (App Router)
│   ├── layout.tsx                        # Root layout: fonts, metadata, Providers
│   ├── Providers.tsx                     # SessionProvider, ThemeProvider, Toaster
│   ├── (auth)/                           # Auth screens (no sidebars)
│   │   ├── layout.tsx
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (root)/                           # Main app with navbar and sidebars
│   │   ├── layout.tsx                    # Navbar, left sidebar, right sidebar
│   │   ├── loading.tsx                   # Shared Loader fallback
│   │   ├── page.tsx                      # Home: questions feed
│   │   ├── ask-question/page.tsx
│   │   ├── questions/[id]/               # Question details, answers
│   │   │   └── edit/                     # Edit a question
│   │   ├── answers/[id]/edit/            # Edit an answer
│   │   ├── tags/                         # All tags
│   │   │   └── [id]/                     # Questions under a tag
│   │   ├── collection/                   # Saved questions
│   │   ├── community/                    # Members
│   │   │   └── [id]/details/             # A member's questions
│   │   ├── profile/
│   │   │   ├── [id]/                     # Profile, Top Posts and Answers tabs
│   │   │   └── edit/                     # Edit your profile
│   │   └── jobs/                         # Jobs board
│   │       ├── new/                      # Post a job
│   │       └── [id]/                     # Job details
│   │           ├── apply/                # Apply to a job
│   │           ├── applicants/           # Poster's applicant list
│   │           └── edit/                 # Edit a job
│   └── api/                              # REST route handlers
│       ├── auth/[...nextauth]/           # Auth.js handler
│       ├── ai/answers/                   # AI answer generation
│       ├── questions/                    # POST: create a question
│       ├── users/                        # Users CRUD, /email, /[id]
│       └── accounts/                     # Accounts CRUD, /provider, /[id]
│   # Every page folder under (root) also has a loading.tsx that re-exports
│   # the shared Loader, so client navigations stay instant.
│
├── features/                             # One folder per domain: actions.ts + components/
│   ├── answers/                          # Create, list, edit, delete answers; AnswerForm, EditAnswerForm
│   ├── auth/                             # Credentials sign-in/up; AuthForm, SocialAuthForm
│   ├── collections/                      # Save/unsave questions, saved list
│   ├── community/                        # Members list and member details
│   ├── jobs/                             # Jobs, applications, saved jobs; types.ts, utils.ts
│   ├── questions/                        # Create, edit, delete, list; service.ts (shared create logic)
│   ├── tags/                             # Tag lists and tag questions; tag-helpers.ts
│   ├── users/                            # Profile data, activity tabs, profile editing
│   └── votes/                            # Votes on questions and answers; hooks/useVote.ts
│
├── server/                               # Server-only infrastructure
│   ├── auth.ts                           # Auth.js config; auth() is cached per request
│   ├── action.ts                         # Validate + authorize + connect wrapper for actions
│   ├── cache-tags.ts                     # Cache tag names and revalidation intervals
│   ├── request-time.ts                   # Defers DB work to request time (Cache Components)
│   ├── errors/                           # HTTP error classes and error handler
│   └── db/                               # connect.ts, models/, schemas/ (with indexes)
│
├── shared/                               # Shared client and server building blocks
│   ├── api/                              # Typed fetch client for the REST endpoints
│   ├── components/
│   │   ├── ui/                           # shadcn/ui primitives (incl. alert-dialog)
│   │   ├── common/                       # Loader, ConfirmDialog, ConfirmDeleteButton, DataRender, ...
│   │   ├── editor/                       # MDX editor and preview
│   │   ├── filters/                      # Shared filters
│   │   ├── navigation/                   # Navbar, sidebars, Pagination
│   │   └── search/                       # Local search bar
│   ├── constants/                        # Routes, filters, empty states, pagination
│   ├── context/                          # Theme context
│   ├── lib/                              # utils, url, validation, logger, question/recommendation helpers
│   └── types/
│
├── proxy.ts                              # Request proxy: forwards the question filter header
├── patches/                              # patch-package patches (next-themes)
├── public/                               # Static assets and icons
├── .github/workflows/                    # CI and deploy workflows
└── Dockerfile                            # Multi-stage standalone build
```

**Dependency rules**

- `app` → `features` → `shared`; `server` is used by `app` and feature `actions.ts`, never by client components.
- A feature is imported only through its public surface: `@/features/<name>/components` or `@/features/<name>/actions`. Features don't reach into each other's internals.
- Relative imports stay inside one area; anything crossing areas uses the `@/` alias (`@/*` → the project root).

---

## 🌐 API Reference

All responses follow the standard envelope format:
```json
{ "success": true, "data": {...}, "statusCode": 200 }
```

> **Note:** The app itself uses **Server Actions** for questions, answers, tags, votes, collections, community and jobs. `POST /api/questions` exists for external tools such as Thunder Client.

### 👥 Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | List all users |
| `POST` | `/api/users` | Create new user (201) |
| `GET` | `/api/users/:id` | Get user by ID |
| `PATCH` | `/api/users/:id` | Update user |
| `DELETE` | `/api/users/:id` | Delete user |
| `POST` | `/api/users/email` | Get user by email |

### 🔐 Accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/accounts` | List all accounts |
| `POST` | `/api/accounts` | Create new account |
| `GET` | `/api/accounts/:id` | Get account by ID |
| `PATCH` | `/api/accounts/:id` | Update account |
| `DELETE` | `/api/accounts/:id` | Delete account |
| `POST` | `/api/accounts/provider` | Get account by provider |

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth.js handler (Google, GitHub, Credentials) |

### 🤖 AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/answers` | Generate AI-powered answers with OpenAI |

### ❓ Questions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/questions` | Create a question as the signed-in user (send the `authjs.session-token` cookie). Body: `{ title, content, tags }`, with Markdown content |

### ⚡ Server Actions

Questions, Answers, Tags, Votes, Collections, Community and Jobs are handled via Server Actions:

| Feature | Action | Description |
|---------|--------|-------------|
| **Users** | `getUser` | Get profile data, statistics, top questions and answers, and up to six question tags |
| | `updateUserProfile` | Update your profile details |
| | `getUserQuestionsActivity` | Get paginated profile questions |
| | `getUserAnswersActivity` | Get paginated profile answers with the current user's vote state |
| **Questions** | `createQuestion` | Create new question with tags |
| | `editQuestion` | Edit existing question |
| | `getQuestion` | Get single question by ID |
| | `getQuestions` | Get paginated questions with search and filters; uses personalized recommendations for signed-in users when the Recommended filter is selected |
| | `getRecommendationQuestions` | Get interaction-based recommendations while excluding previously interacted questions |
| | `getHotQuestions` | Get top questions for the right sidebar |
| | `incrementQuestionViews` | Track question views |
| | `deleteQuestion` | Delete your question with its answers and votes |
| **Interactions** | `createInteraction` | Record user activity and apply reputation changes |
| **Answers** | `createAnswer` | Create answer for question |
| | `getAnswers` | Get paginated answers with filters |
| | `getAnswerForEdit` | Load your answer for its edit page |
| | `editAnswer` | Edit your answer |
| | `deleteAnswer` | Delete your answer and its votes |
| **Tags** | `getTags` | Get paginated tags with filters |
| | `getTagQuestions` | Get questions for specific tag |
| | `getTopTags` | Get popular tags for the right sidebar |
| **Votes** | `CreateVote` / `UpdateVote` | Cast, switch, or remove an upvote/downvote |
| | `hasVoted` | Check the current user's vote on a question or answer |
| | `getUserVotesForTargets` | Batch-check votes for multiple targets |
| **Collection** | `toggleSaveQuestion` | Save or unsave a question |
| | `hasSavedQuestion` | Check whether a question is saved |
| | `getSaveQuestions` | Get the user's saved questions (paginated, filtered) |
| **Community** | `getUsers` | Get paginated users with search and filters |
| | `getCommunityMember` | Get a member and their questions |
| **Jobs** | `getJobs` | Get paginated jobs with search, filters and salary sorting |
| | `getJobById` / `getJobViewerState` | Get a job and the viewer's applied/saved state |
| | `createJob` / `editJob` / `deleteJob` | Post, edit or delete a job (poster only) |
| | `applyToJob` / `toggleSaveJob` | Apply to or save a job |
| | `getJobApplicants` / `updateApplicationStatus` | Review applicants and set their status |
| **Auth** | `signUpWithCredentials` | User registration |
| | `signInWithCredentials` | User login |
| | `logout` | User sign out |

---

## 🐳 Docker

Run the application and a local MongoDB database with Docker Compose:

```powershell
# Create your local environment file from the template
Copy-Item .env.example .env

# Replace AUTH_SECRET in .env with a generated secret, then build and start
docker compose up --build -d

# Follow application logs
docker compose logs -f app

# Stop the stack (the MongoDB volume is preserved)
docker compose down

# Stop the stack and delete the local MongoDB data
docker compose down -v
```

Open [http://localhost:3000](http://localhost:3000). Compose waits for MongoDB's health check before starting the app, and stores database files in the `mongodb_data` named volume. Add optional GitHub, Google, and OpenAI credentials to `.env` to enable those integrations.

This Compose database is for local development. MongoDB is not published to the host, but it has no database authentication on the private Compose network. Use a secured MongoDB deployment such as Atlas for production and set `MONGODB_URI` to its connection string in your production environment; do not commit `.env`.

To build only the standalone application image, run `docker build -t devflow:latest .`. Set `MONGODB_URI` and `AUTH_SECRET` when starting the container; add provider/API keys only for features you enable.

---

## 🔄 CI/CD Pipeline

GitHub Actions automate testing and deployment:

### Workflows

| Workflow | Trigger | Action |
|----------|---------|--------|
| **CI** | PR or push to `main`/`dev` | Lint → Type-check → Build |
| **Deploy (Dev)** | Push to `dev` | Build → Push `ghcr.io/.../devflow:dev` |
| **Deploy (Prod)** | Push to `main` | Build → Push `ghcr.io/.../devflow:latest` |

### Setup

1. Configure **Settings → Environments** in your GitHub repo
2. Add secrets for `development` and `production` environments:
   - `MONGODB_URI`
   - `AUTH_SECRET`
   - OAuth credentials
   - Docker registry credentials (if using GHCR)

---

## 📊 Performance

- 🎯 **Next.js App Router** with Server Components and Server Actions
- ⚡ **Cache Components & Partial Prefetching**: a prerendered static shell (navbar, sidebars, loaders) with page data streamed in
- 🗃️ **Cached lists** for questions and tags (`unstable_cache` + tags), invalidated with `updateTag` / `revalidateTag` on every change
- 🔐 **One session read per request** via React `cache()` around `auth()`
- 🧩 **Client-only MDX editor** loaded with `next/dynamic` to keep it out of server rendering
- 🗜️ **Optimized Bundle** with tree-shaking
- 📦 **MongoDB Indexing** for feeds, answers by question, vote lookups, saved questions, tag links, accounts and profile queries
- 🏷️ **Bounded Tag Retrieval** groups profile tags, limits the IDs, then fetches names in one query without `$lookup`
- 🚀 **Docker Multi-stage Build** for minimal image size

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request against the `dev` branch

### Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Reference related issues in your PR

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check your MONGODB_URI format
# Expected: mongodb+srv://username:password@cluster.mongodb.net/dbname
# Make sure your IP is whitelisted in MongoDB Atlas
```

### NextAuth Errors
```bash
# Regenerate AUTH_SECRET
npx auth secret

# Verify OAuth credentials in your provider settings
```

### Build Fails
```bash
# Clear cache and reinstall
rm -rf .next node_modules
yarn install
yarn build
```

---

## 📝 License

This project is licensed under the [MIT License](LICENSE) — feel free to use it in your projects!

---

## 🙋 Support & Contribution

**Have questions or want to contribute?**

- 💬 [GitHub Discussions](https://github.com/osamaayub/DevFlow/discussions) — Ask questions & discuss features
- 🐛 [Report Issues](https://github.com/osamaayub/DevFlow/issues) — Found a bug? Let us know
- 📖 [Documentation](#) — Coming soon with API guides & architecture
- 👥 [Join Development](https://github.com/osamaayub/DevFlow) — We welcome contributors!
- ⭐ [Star the repo](https://github.com/osamaayub/DevFlow) — Shows your support!

---

<div align="center">

Made with ❤️ by [Osama Ayub](https://github.com/osamaayub)

[⬆ Back to Top](#devflow)

</div>
