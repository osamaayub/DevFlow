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

> 🚀 **Project Status:** Currently in active development. Core features are being implemented. Check back soon for the live demo!


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
View responsive profiles with bio, location, portfolio, activity stats, and paginated questions and answers. Users can edit their profile details.

### 🔥 Hot Network & Popular Tags
Right sidebar highlights top-voted questions and the most-used tags.

</td>
</tr>
<tr>
<td colspan="2">

### ✍️ Rich Editor
Markdown editor (MDXEditor, loaded client-side only) for questions and answers, with syntax-highlighted code blocks rendered via Bright.

### 🧭 Filters & Pagination
Shared filter components and pagination across home, tags, tag details, collection, community, and answers.

### 📊 Structured Logging
Request and error logging with Pino for debugging and monitoring.

### 🤖 AI-Powered Answers
Generate intelligent answers using OpenAI integration.

</td>
</tr>
</table>

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
- [x] URL utilities and helpers
- [x] AI Answer UI integration (API implemented, UI Implemented)
- [x] Vote system (upvotes/downvotes) for questions and answers with optimistic updates
- [x] Home filters (newest, recommended, frequent, unanswered)
- [x] Shared filter component for tags, collection, community, and answers
- [x] Pagination for questions, tags, tag details, answers, collection, and community
- [x] Tag details page
- [x] Community page with search, filters, and member details page
- [x] User profiles with editable profile details, activity tabs, statistics, and pagination
- [x] Right sidebar with hot questions and popular tags
- [x] Back button across pages
- [x] MDX editor loaded client-side only (fixes "This page couldn't load" on ask-question and question details)
- [x] CI workflow (lint, type-check, build) and Docker image publishing to GHCR

### 🚧 In Progress
- [ ] Jobs page implementation (placeholder exists)
- [ ] Question deletion UI (`deleteQuestion` action exists)

### 📋 Planned
- [ ] Interaction tracking - Schema exists, implementation pending
- [ ] Answer editing and deletion
- [ ] User management actions
- [ ] Live demo deployment
- [ ] Admin dashboard
- [ ] Real-time notifications
- [ ] Advanced analytics and reporting
- [ ] Community features (comments, discussions)
- [ ] Badge system and gamification
- [ ] API rate limiting
- [ ] Additional OAuth providers
- [ ] Enhanced search algorithms
- [ ] Performance optimizations
- [ ] Additional unit and integration tests

---

## 📁 Project Structure

```
DevFlow/
├── src/
│   ├── app/                         # Routes only: thin pages, layouts, API handlers
│   │   ├── (auth)/                  # sign-in, sign-up
│   │   ├── (root)/                  # home, ask-question, questions/[id], tags, community, ...
│   │   ├── api/                     # REST endpoints (accounts, users, ai/answers, auth)
│   │   ├── layout.tsx
│   │   └── Providers.tsx
│   ├── features/                    # Vertical slices: one folder per domain
│   │   ├── answers/                 # actions.ts + components/ (AnswerForm, AnswerCard, AllAnswers)
│   │   ├── auth/                    # actions.ts, sign-out.action.ts + components/ (AuthForm, SocialAuthForm)
│   │   ├── collections/             # actions.ts (saved questions)
│   │   ├── community/               # actions.ts + components/ (UserCard, CommunityMemberProfile)
│   │   ├── questions/               # actions.ts + components/ (QuestionForm, QuestionCard, SaveQuestion)
│   │   ├── tags/                    # actions.ts, tag-helpers.ts + components/ (TagCards)
│   │   ├── users/                    # actions.ts + components/ (profile, activity, and profile editing)
│   │   └── votes/                    # actions.ts, vote-state.ts, components/, hooks/useVote.ts
│   ├── server/                      # Server-only infrastructure (never imported by client code)
│   │   ├── auth.ts                  # NextAuth configuration
│   │   ├── action.ts                # Validate + authorize + connect wrapper for server actions
│   │   ├── errors/                  # HTTP error classes, error handler
│   │   └── db/                      # connect.ts, models/, schemas/ (guarded by "server-only")
│   ├── shared/                      # Client-safe building blocks used across features
│   │   ├── api/                     # Typed fetch client for the REST endpoints
│   │   ├── components/              # ui/ (shadcn), common/, editor/, filters/, navigation/, search/
│   │   ├── constants/
│   │   ├── context/                 # Theme context
│   │   ├── lib/                     # utils, url, validation (zod), logger
│   │   └── types/
│   └── proxy.ts                     # Request proxy: forwards the question filter header
├── patches/                         # patch-package patches (next-themes)
├── public/                          # Static assets
├── .github/workflows/               # CI and deploy workflows
└── Dockerfile                       # Multi-stage standalone build
```

**Dependency rules**

- `app` → `features` → `shared`; `server` is used by `app` and feature `actions.ts`, never by client components.
- A feature is imported only through its public surface: `@/features/<name>/components` or `@/features/<name>/actions`. Features don't reach into each other's internals.
- Relative imports stay inside one area; anything crossing areas uses the `@/` alias (`@/*` → `src/*`).

---

## 🌐 API Reference

All responses follow the standard envelope format:
```json
{ "success": true, "data": {...}, "statusCode": 200 }
```

> **Note:** Questions, Answers, and Tags use **Server Actions** instead of REST API endpoints for better performance and type safety.

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

### ⚡ Server Actions

Questions, Answers, Tags, Votes, Collections, and Community are handled via Server Actions instead of REST API:

| Feature | Action | Description |
|---------|--------|-------------|
| **Questions** | `createQuestion` | Create new question with tags |
| | `editQuestion` | Edit existing question |
| | `getQuestion` | Get single question by ID |
| | `getQuestions` | Get paginated questions with search and filters |
| | `getHotQuestions` | Get top questions for the right sidebar |
| | `incrementQuestionViews` | Track question views |
| | `deleteQuestion` | Delete a question (no UI yet) |
| **Answers** | `createAnswer` | Create answer for question |
| | `getAnswers` | Get paginated answers with filters |
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
| **Auth** | `signUpWithCredentials` | User registration |
| | `signInWithCredentials` | User login |
| | `logout` | User sign out |

---

## 🐳 Docker

Build and run DevFlow in a containerized environment:

```bash
# Build the image
docker build -t devflow .

# Run the container
docker run -p 3000:3000 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e AUTH_SECRET="your-secret-key" \
  -e AUTH_GITHUB_ID="your-github-id" \
  -e AUTH_GITHUB_SECRET="your-github-secret" \
  devflow
```

The image runs as a non-root user on port `3000` for security.

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
- 🧩 **Client-only MDX editor** loaded with `next/dynamic` to keep it out of server rendering
- 🗜️ **Optimized Bundle** with tree-shaking
- 📦 **MongoDB Indexing** for fast queries
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
