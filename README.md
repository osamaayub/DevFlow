# DevFlow

> A modern, community-driven Q&A platform for developers — inspired by Stack Overflow.

DevFlow lets developers ask and answer programming questions, organize content with tags, and collaborate with the community. It's built with the Next.js App Router, MongoDB, and NextAuth, and ships with a containerized Docker build and GitHub Actions CI/CD.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Docker](#docker)
- [CI/CD](#cicd)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Ask & answer questions** — post questions, write detailed answers, and help others.
- **Search & filters** — find questions via full-text search and tag/category filters.
- **Tagging system** — organize questions with technology tags (React, JavaScript, etc.).
- **Authentication** — sign in with Google, GitHub, or email via NextAuth.
- **Dark / light theme** — seamless theme switching.
- **Responsive design** — optimized for desktop and mobile.
- **Rich editor** — Markdown/MDX editor for formatting questions and answers.
- **Structured logging** — request and error logging with Pino.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack), [React 19](https://react.dev) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Database | [MongoDB](https://www.mongodb.com/) via [Mongoose 8](https://mongoosejs.com/) |
| Auth | [NextAuth.js v5](https://authjs.dev/) (Google, GitHub, Credentials) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Lucide](https://lucide.dev/) |
| Forms & validation | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| Editor | [MDX Editor](https://mdxeditor.dev/) |
| Logging | [Pino](https://getpino.io/) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **≥ 22.13** (the project depends on packages that require this engine)
- [Yarn](https://yarnpkg.com/) (the repo uses `yarn.lock`)
- A [MongoDB](https://www.mongodb.com/) connection string (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/osamaayub/DevFlow.git
   cd DevFlow
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure environment variables**

   Copy the example file and fill in your values:
   ```bash
   cp .env.example .env.local
   ```
   See [Environment Variables](#environment-variables) for what each value means.

4. **Run the development server**
   ```bash
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Env files are loaded by environment:

- `.env.local` — always loaded locally (gitignored); good for shared local overrides.
- `.env.development.local` — used by `yarn dev`. Copy from `.env.development.example`.
- `.env.production.local` — used by `yarn build` / `yarn start`. Copy from `.env.production.example`.

In CI/CD, production values come from the `production` GitHub Environment secrets instead. Set the following in each:

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string. Required at build and runtime. |
| `AUTH_SECRET` | Yes | Secret used by NextAuth to encrypt tokens. Generate with `npx auth secret`. |
| `AUTH_GITHUB_ID` | For GitHub login | GitHub OAuth app client ID. |
| `AUTH_GITHUB_SECRET` | For GitHub login | GitHub OAuth app client secret. |
| `AUTH_GOOGLE_ID` | For Google login | Google OAuth client ID. |
| `AUTH_GOOGLE_SECRET` | For Google login | Google OAuth client secret. |
| `LOG_LEVEL` | No | Pino log level (`debug`, `info`, `warn`, `error`). Defaults to `debug` in development and `info` in production. |

## Available Scripts

| Script | Description |
| --- | --- |
| `yarn dev` | Start the dev server with Turbopack. |
| `yarn build` | Create a production build. |
| `yarn start` | Run the production server. |
| `yarn lint` | Run ESLint. |

## API Reference

All API routes live under `app/api`. Successful responses use the envelope `{ success, data, statusCode }`; errors are normalized by `HandleError` into `{ success: false, statusCode, message, error? }`.

### Users

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/users` | List all users. |
| `POST` | `/api/users` | Create a user (body = user fields). Returns `201`. |
| `GET` | `/api/users/:id` | Get a single user by id. `404` if not found. |
| `PATCH` | `/api/users/:id` | Update a user by id. `404` if not found. |
| `DELETE` | `/api/users/:id` | Delete a user by id. `404` if not found. |

### Auth

| Method | Route | Description |
| --- | --- | --- |
| `GET`/`POST` | `/api/auth/[...nextauth]` | NextAuth.js handler (sign in, callbacks, session). |

## Project Structure

```
app/          Next.js App Router — pages, layouts, and API routes
components/   UI components (forms, navigation, cards, etc.)
constants/    Static data and route definitions
context/      React context providers (e.g., Theme)
database/     Mongoose schemas, models, and connection logic
lib/          Utilities: validation, error handling, logging, db connect
types/        TypeScript type definitions
public/       Static assets
auth.ts       NextAuth configuration
proxy.ts      Middleware / proxy configuration
```

## Docker

A multi-stage `Dockerfile` produces a slim, standalone Next.js image that runs as a non-root user on port `3000`.

```bash
# Build the image
docker build -t devflow .

# Run it (provide your runtime environment variables)
docker run -p 3000:3000 \
  -e MONGODB_URI="<your-mongodb-uri>" \
  -e AUTH_SECRET="<your-secret>" \
  devflow
```

> The build passes a throwaway placeholder `MONGODB_URI` because `lib/mongoose.ts` requires it at import time; provide real values at runtime.

## CI/CD

GitHub Actions provide separate pipelines per branch:

- **CI** (`.github/workflows/ci.yml`) — runs on pull requests and pushes to `main` and `dev`: installs dependencies, lints, and builds.
- **Deploy (development)** (`.github/workflows/deploy-dev.yml`) — on push to `dev`, builds and pushes `ghcr.io/<owner>/devflow:dev` using the `development` GitHub Environment.
- **Deploy (production)** (`.github/workflows/deploy-prod.yml`) — on push to `main`, builds and pushes `ghcr.io/<owner>/devflow:latest` using the `production` GitHub Environment.

Configure environment-scoped secrets under **Settings → Environments** for each environment.

## Contributing

Contributions are welcome! Please open an issue to discuss substantial changes, and submit pull requests against the `dev` branch.

## License

Released under the [MIT](LICENSE) License.
