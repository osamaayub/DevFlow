# DevFlow

<div align="center">

### A modern developer community built for asking questions, sharing knowledge, and learning together.

**DevFlow** is a full-stack Q&A platform designed specifically for developers — combining a modern Next.js interface with a scalable MongoDB backend, secure authentication, structured server actions, rich Markdown/MDX content, and a clean component architecture.

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge\&logo=next.js\&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge\&logo=mongodb\&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge\&logo=tailwindcss\&logoColor=white)](https://tailwindcss.com/)
[![NextAuth](https://img.shields.io/badge/Auth.js-v5-purple?style=for-the-badge)](https://authjs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br />

[**Explore the Repository →**](https://github.com/osamaayub/DevFlow)

</div>

---

## ✦ Overview

DevFlow is a developer-focused community platform inspired by modern Q&A communities.

The goal is simple:

> **Make it easier for developers to ask better questions, share reliable answers, discover useful knowledge, and grow together.**

The application is built using the **Next.js App Router** with a strongly typed TypeScript codebase, MongoDB/Mongoose for persistence, Auth.js for authentication, and a reusable component architecture.

The project emphasizes:

* Clean architecture
* Type-safe development
* Reusable components
* Secure authentication
* Server-side business logic
* Structured validation
* Scalable database models
* Maintainable code organization

---

## ✨ Core Features

### 💬 Questions & Answers

Developers can create questions and provide detailed answers, creating a knowledge-sharing environment focused on solving real-world programming problems.

* Create questions
* Write detailed answers
* Edit content
* View question details
* Manage answers
* Structured question/answer data models

---

### 🏷️ Developer Tags

Organize questions around technologies and development topics.

Examples:

```text
JavaScript
TypeScript
React
Next.js
Node.js
MongoDB
Python
```

Tags make technical content easier to organize and discover.

---

### 🔎 Search & Discovery

DevFlow is designed around discovering relevant developer content.

The application supports structured filtering and query handling for finding questions based on relevant criteria.

---

### 🔐 Authentication

Authentication is handled through **Auth.js / NextAuth** with support for multiple authentication strategies.

Supported providers include:

* GitHub
* Google
* Credentials

Authentication state is integrated throughout the application to protect user-specific functionality.

---

### 👤 Developer Accounts

User accounts provide the foundation for personalized community experiences.

The application maintains structured user information and authentication data using MongoDB.

---

### ✍️ Rich Markdown / MDX Content

DevFlow uses **MDX Editor** to provide a developer-friendly writing experience.

This makes it possible to write content containing:

* Markdown
* Code blocks
* Headings
* Lists
* Links
* Rich formatting

This is particularly useful for programming questions and technical answers.

---

### 🌗 Dark & Light Mode

A theme system provides a comfortable experience across different environments.

* Light mode
* Dark mode
* Persistent theme preference
* System-friendly UI

---

### 📱 Responsive Interface

The interface is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile

The UI is built using Tailwind CSS and reusable component primitives.

---

### 🧩 Reusable Component System

DevFlow follows a modular component architecture.

The project separates reusable UI elements, forms, layouts, database logic, actions, validation, and utilities to keep the codebase maintainable.

---

### 🛡️ Validation & Error Handling

Input validation is handled using **Zod**.

The application also includes dedicated handlers and HTTP error utilities for consistent error management.

```text
Request
   ↓
Validation
   ↓
Authorization
   ↓
Server Action
   ↓
Database
   ↓
Response
```

---

### 📊 Structured Logging

DevFlow uses **Pino** for structured application logging.

Logging is useful for:

* Debugging
* Request tracking
* Error investigation
* Development diagnostics
* Production monitoring

---

## 🧰 Technology Stack

| Layer                | Technology                         |
| -------------------- | ---------------------------------- |
| **Framework**        | Next.js 16                         |
| **UI**               | React 19                           |
| **Language**         | TypeScript                         |
| **Database**         | MongoDB                            |
| **ODM**              | Mongoose 8                         |
| **Authentication**   | Auth.js / NextAuth.js v5           |
| **Styling**          | Tailwind CSS 4                     |
| **Components**       | Radix UI / shadcn-style components |
| **Icons**            | Lucide React                       |
| **Forms**            | React Hook Form                    |
| **Validation**       | Zod                                |
| **Editor**           | MDX Editor                         |
| **Content**          | MDX Remote                         |
| **Notifications**    | Sonner                             |
| **HTTP**             | Axios                              |
| **Logging**          | Pino                               |
| **Formatting**       | Prettier                           |
| **Code Quality**     | ESLint                             |
| **Database Adapter** | Auth.js MongoDB Adapter            |
| **Deployment**       | Docker-ready                       |

The current dependency configuration confirms the project's Next.js 16, React 19, Mongoose 8, Auth.js v5, Tailwind CSS 4, MDX Editor, Pino, React Hook Form, Zod, Axios, and related tooling.

---

# 🏗️ Architecture

DevFlow follows a layered architecture designed to separate UI, application logic, validation, authentication, and database concerns.

```text
┌─────────────────────────────────────────────┐
│                 Client / UI                 │
│                                             │
│   Next.js • React • Tailwind • Radix UI     │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│              Server Actions                 │
│                                             │
│       Business Logic • Authorization        │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│             Validation Layer                │
│                                             │
│                   Zod                       │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│             Database Layer                  │
│                                             │
│          Mongoose • MongoDB                 │
└─────────────────────────────────────────────┘
```

Authentication is handled separately through Auth.js, while shared handlers and utilities provide common application infrastructure.

---

# 📁 Project Structure

```text
DevFlow/
│
├── app/
│   ├── api/                 # API routes
│   ├── [routes]/            # Application routes
│   ├── layout.tsx           # Root layout
│   └── ...
│
├── components/
│   ├── ui/                  # Reusable UI primitives
│   ├── forms/               # Form components
│   ├── cards/               # Content cards
│   ├── filters/             # Filtering UI
│   └── ...
│
├── constants/
│   └── Application constants
│
├── context/
│   └── React context providers
│
├── database/
│   ├── models/              # Mongoose models
│   ├── schemas/             # Database schemas
│   └── index.ts             # Database exports
│
├── lib/
│   ├── actions/             # Server actions
│   ├── handlers/            # Error/request handlers
│   ├── api.ts               # API utilities
│   ├── fetch.ts             # Fetch helpers
│   ├── logger.ts            # Pino logger
│   ├── mongoose.ts          # MongoDB connection
│   ├── validation.ts        # Validation utilities
│   └── ...
│
├── public/
│   └── Static assets
│
├── types/
│   └── TypeScript definitions
│
├── auth.ts                  # Auth.js configuration
├── Middleware.ts            # Middleware
├── Dockerfile               # Container configuration
├── next.config.ts
├── package.json
└── README.md
```

The current repository contains dedicated `app`, `components`, `constants`, `context`, `database`, `lib`, `public`, and `types` directories, with separate database models/schemas and application handlers/utilities.

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* Node.js 22+
* npm or Yarn
* MongoDB local instance or MongoDB Atlas
* Git

---

## 1. Clone the repository

```bash
git clone https://github.com/osamaayub/DevFlow.git
```

```bash
cd DevFlow
```

---

## 2. Install dependencies

Using npm:

```bash
npm install
```

Or Yarn:

```bash
yarn install
```

---

## 3. Configure environment variables

Create a `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string

AUTH_SECRET=your_auth_secret

AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret

AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

LOG_LEVEL=debug
```

### Generate an Auth Secret

```bash
npx auth secret
```

> Never commit `.env.local` or any production credentials to Git.

---

## 4. Start the development server

```bash
npm run dev
```

Or:

```bash
yarn dev
```

The application will be available at:

```text
http://localhost:3000
```

---

# 🔐 Authentication Configuration

DevFlow uses Auth.js / NextAuth for authentication.

### GitHub

Create an OAuth application through GitHub Developer Settings and configure:

```env
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
```

### Google

Create OAuth credentials through Google Cloud Console:

```env
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

### Credentials

The project also supports credentials-based authentication.

---

# 🗄️ Database

DevFlow uses **MongoDB with Mongoose**.

The database layer is organized into:

```text
database/
├── models/
├── schemas/
└── index.ts
```

This separation keeps persistence logic independent from UI and application-level logic.

---

# ⚙️ Available Scripts

```bash
# Start development server
npm run dev

# Create production build
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

The current project scripts use Webpack for the development server (`next dev --webpack`), while production uses the standard Next.js build/start workflow.

---

# 🐳 Docker

DevFlow includes a Dockerfile for containerized deployments.

### Build

```bash
docker build -t devflow .
```

### Run

```bash
docker run -p 3000:3000 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e AUTH_SECRET="your-auth-secret" \
  devflow
```

---

# 🧪 Code Quality

The project uses several tools to maintain code quality and consistency:

* ESLint
* Prettier
* TypeScript
* Zod
* React Hook Form
* Patch Package

Run linting with:

```bash
npm run lint
```

---

# 📈 Engineering Highlights

DevFlow demonstrates several real-world full-stack development patterns:

### Type-safe application development

TypeScript is used throughout the application to reduce runtime errors and improve developer experience.

### Server-side business logic

Application operations are organized into server actions rather than placing business logic directly inside UI components.

### Database abstraction

Mongoose models and schemas provide a structured interface for MongoDB.

### Centralized validation

Zod schemas provide consistent input validation.

### Authentication & authorization

Auth.js handles authentication while application logic controls protected operations.

### Centralized error handling

Dedicated handlers and HTTP error utilities provide a consistent error-management approach.

### Structured logging

Pino provides structured logs suitable for debugging and production environments.

---

# 🗺️ Development Roadmap

DevFlow is actively evolving.

### Completed

* [x] Next.js App Router foundation
* [x] TypeScript architecture
* [x] MongoDB integration
* [x] Mongoose models and schemas
* [x] Authentication infrastructure
* [x] Credentials authentication
* [x] OAuth authentication infrastructure
* [x] Server actions
* [x] Validation with Zod
* [x] React Hook Form integration
* [x] MDX Editor integration
* [x] Tailwind CSS
* [x] Reusable UI components
* [x] Dark/light theme
* [x] Structured logging
* [x] Centralized error handling
* [x] Docker configuration

### 🚧 In Progress

* [ ] Expand question/answer workflows
* [ ] Improve search and discovery
* [ ] Expand tag functionality
* [ ] Enhance user profiles
* [ ] Reputation system
* [ ] Performance improvements
* [ ] Production deployment

### 🔮 Future

* [ ] Advanced developer search
* [ ] Notifications
* [ ] Bookmarks
* [ ] Voting/reputation enhancements
* [ ] Moderation tools
* [ ] Analytics dashboard
* [ ] Admin dashboard

---

# 🤝 Contributing

Contributions are welcome.

### 1. Fork the repository

```bash
git clone https://github.com/osamaayub/DevFlow.git
```

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

### 3. Make your changes

Follow the existing project structure and coding conventions.

### 4. Run linting

```bash
npm run lint
```

### 5. Commit

```bash
git commit -m "feat: add your feature"
```

### 6. Push

```bash
git push origin feature/your-feature
```

### 7. Open a Pull Request

Describe the changes and include any relevant screenshots or technical notes.

---

# 🐛 Issues & Feature Requests

Found a bug or have an idea?

**Open an issue:**

https://github.com/osamaayub/DevFlow/issues

---

# 📄 License

This project is licensed under the **MIT License**.

See [`LICENSE`](LICENSE) for more information.

---

# 👨‍💻 Author

<div align="center">

### Osama Ayub

Full-Stack Developer

Building modern web applications with **Next.js, React, TypeScript, Node.js, MongoDB, and modern backend architecture.**

<br />

[![GitHub](https://img.shields.io/badge/GitHub-osamaayub-181717?style=for-the-badge\&logo=github)](https://github.com/osamaayub)

</div>

---

<div align="center">

### ⭐ If DevFlow is useful or interesting, consider starring the repository.

**Ask. Answer. Learn. Build.**

Made with ❤️ by **Osama Ayub**

</div>
