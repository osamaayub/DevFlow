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

</td>
<td width="50%">

### 🔐 Authentication
Sign in with Google, GitHub, or email via NextAuth.

### 🌓 Dark / Light Theme
Seamless theme switching for comfortable viewing.

### 📱 Responsive Design
Optimized for desktop, tablet, and mobile devices.

</td>
</tr>
<tr>
<td colspan="2">

### ✍️ Rich Editor
Markdown/MDX editor with live preview for formatting questions and answers.

### 📊 Structured Logging
Request and error logging with Pino for debugging and monitoring.

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|:---:|:---|
| **Frontend** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) • [React 19](https://react.dev) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [MongoDB](https://www.mongodb.com/) via [Mongoose 8](https://mongoosejs.com/) |
| **Auth** | [NextAuth.js v5](https://authjs.dev/) (Google, GitHub, Credentials) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) • [shadcn/ui](https://ui.shadcn.com/) • [Radix UI](https://www.radix-ui.com/) • [Lucide](https://lucide.dev/) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) • [Zod](https://zod.dev/) |
| **Editor** | [MDX Editor](https://mdxeditor.dev/) |
| **Logging** | [Pino](https://getpino.io/) |

</div>

---

## 🚀 Quick Start

### Prerequisites

```bash
✓ Node.js ≥ 22.13
✓ Yarn 4.x
✓ MongoDB (local or Atlas)
```

### Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/osamaayub/DevFlow.git
cd DevFlow

# 2️⃣ Install dependencies
yarn install

# 3️⃣ Set up environment variables
cp .env.example .env.local

# 4️⃣ Configure your .env.local with:
# MONGODB_URI, AUTH_SECRET, OAuth credentials (see below)

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

---

## 📋 Available Scripts

```bash
# Development
yarn dev          # Start dev server with Turbopack

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
- [x] MongoDB & Mongoose integration
- [x] NextAuth.js authentication (Google, GitHub, Email)
- [x] Database models (Questions, Answers, Users, Tags)
- [x] Server actions for CRUD operations
- [x] Tailwind CSS & component styling
- [x] Dark/Light theme support

### 🚧 In Progress
- [ ] Question & Answer functionality UI
- [ ] Search & filtering optimization
- [ ] Tag management system
- [ ] User profiles & reputation system
- [ ] Rich text editor integration
- [ ] Performance optimizations

### 📋 Planned
- [ ] Live demo deployment
- [ ] Admin dashboard
- [ ] Advanced search algorithms

---

## 📁 Project Structure

```
DevFlow/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── [routes]/          # Page routes
├── components/            # Reusable React components
│   ├── cards/            # Question, answer, tag cards
│   ├── forms/            # Ask, answer, search forms
│   ├── filters/          # Filter components
│   └── ui/               # Base UI components
├── context/              # React context providers (Theme, etc.)
├── database/             # Mongoose schemas & models
│   ├── question.model.ts
│   ├── answer.model.ts
│   ├── user.model.ts
│   └── tag.model.ts
├── lib/                  # Utilities & helpers
│   ├── actions/         # Server actions
│   ├── validation/       # Zod schemas
│   ├── error-handler/    # Error handling
│   └── mongoose.ts      # DB connection
├── types/               # TypeScript definitions
├── constants/           # Static data (routes, filters, etc.)
├── public/              # Static assets (images, icons)
└── auth.ts             # NextAuth configuration
```

---

## 🌐 API Reference

All responses follow the standard envelope format:
```json
{ "success": true, "data": {...}, "statusCode": 200 }
```

### 👥 Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | List all users |
| `POST` | `/api/users` | Create new user (201) |
| `GET` | `/api/users/:id` | Get user by ID |
| `PATCH` | `/api/users/:id` | Update user |
| `DELETE` | `/api/users/:id` | Delete user |

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth.js handler |

### ❓ Questions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/questions` | List questions with filters |
| `POST` | `/api/questions` | Create new question |
| `GET` | `/api/questions/:id` | Get single question |
| `PATCH` | `/api/questions/:id` | Update question |
| `DELETE` | `/api/questions/:id` | Delete question |

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
| **CI** | PR to `main`/`dev` | Lint → Test → Build |
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

- ⚡ **Turbopack** for near-instant HMR
- 🎯 **Next.js App Router** with Server Components
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
