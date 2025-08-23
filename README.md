# DevFlow

DevFlow is a modern, community-driven Q&A platform for developers, inspired by Stack Overflow. Built with [Next.js](https://nextjs.org), it enables users to ask and answer programming questions, share knowledge, and collaborate with developers worldwide.

## Features

- 📝 **Ask & Answer Questions:** Post questions, provide detailed answers, and help others.
- 🔍 **Powerful Search & Filters:** Quickly find questions using full-text search and tag/category filters.
- 🏷️ **Tagging System:** Organize questions with technology tags (React, JavaScript, etc.).
- 👤 **Authentication:** Sign up or log in with email, Google, or GitHub.
- 🌗 **Dark/Light Theme:** Seamless theme switching for comfortable browsing.
- 📱 **Responsive Design:** Fully optimized for desktop and mobile devices.
- 🛠️ **Rich Editor:** Markdown/MDX editor for formatting questions and answers.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/osamaayub/DevFlow.git
   cd DevFlow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local` and fill in your credentials (NextAuth, database, etc.).

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Project Structure

- `app/` — Next.js app directory (routes, layouts, pages)
- `components/` — UI components (forms, navigation, cards, etc.)
- `constants/` — Static data and configuration
- `context/` — React context providers (e.g., Theme)
- `lib/` — Utility functions and validation schemas
- `types/` — TypeScript type definitions

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS 4, TypeScript
- **Auth:** NextAuth.js (Google, GitHub, Email)
- **Forms:** React Hook Form, Zod
- **Editor:** MDX Editor
- **UI:** Shadcn UI, Lucide Icons

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## License

[MIT](LICENSE)

---

Made with ❤️
