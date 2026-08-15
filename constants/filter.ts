// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Tag {
  _id: string
  name: string
}

export interface Author {
  _id: string
  name: string
  image: string
}

export interface Question {
  _id: string
  title: string
  description: string
  content: string
  tags: Tag[]
  author: Author
  upvotes: number
  downvotes: number
  answers: number
  views: number
  createdAt: Date
}

export interface HomeFilter {
  name: string
  value: string
}

// ============================================
// HOME FILTERS
// ============================================

export const homeFilters: HomeFilter[] = [
  {
    name: "newest",
    value: "Newest"
  },
  {
    name: "recommended",
    value: "Recommended"
  },
  {
    name: "frequent",
    value: "Frequent"
  },
  {
    name: "unanswered",
    value: "UnAnswered"
  }
]

// ============================================
// QUESTIONS DATA
// ============================================

export const questions: Question[] = [
  {
    _id: "1",
    title: "How to learn React?",
    description: "I want to learn React, can anyone help me?",
    content:
      "React is a JavaScript library for building user interfaces. To get started, I recommend learning JavaScript fundamentals first, then moving on to React basics like components, hooks, and state management. Practice by building projects of increasing complexity.",
    tags: [
      { _id: "1", name: "React" },
      { _id: "2", name: "JavaScript" }
    ],
    author: {
      _id: "1",
      name: "John Doe",
      image:
        "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg"
    },
    upvotes: 10,
    downvotes: 2,
    answers: 5,
    views: 100,
    createdAt: new Date()
  },
  {
    _id: "2",
    title: "How to learn JavaScript?",
    description: "I want to learn JavaScript, can anyone help me?",
    content:
      "JavaScript is a versatile programming language used for web development. Start with variables, data types, functions, and DOM manipulation. Practice with real-world projects to solidify your understanding. Use resources like MDN, freeCodeCamp, or Codecademy.",
    tags: [
      { _id: "1", name: "JavaScript" },
      { _id: "3", name: "WebDevelopment" }
    ],
    author: {
      _id: "2",
      name: "Jane Smith",
      image:
        "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg"
    },
    upvotes: 15,
    downvotes: 1,
    answers: 8,
    views: 150,
    createdAt: new Date("2021-09-01")
  },
  {
    _id: "3",
    title: "What is TypeScript and why use it?",
    description: "Can someone explain TypeScript and its benefits?",
    content:
      "TypeScript is a typed superset of JavaScript that adds static typing. It helps catch errors at compile time, improves code readability, and provides better IDE support for large projects. It's especially useful in large-scale applications.",
    tags: [
      { _id: "4", name: "TypeScript" },
      { _id: "2", name: "JavaScript" }
    ],
    author: {
      _id: "3",
      name: "Mike Johnson",
      image:
        "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg"
    },
    upvotes: 20,
    downvotes: 0,
    answers: 7,
    views: 200,
    createdAt: new Date("2021-08-15")
  },
  {
    _id: "4",
    title: "Best practices for React Hooks",
    description: "What are the best practices when using React Hooks?",
    content:
      "When using React Hooks, always follow the rules of hooks: only call hooks at the top level of your component, never inside loops or conditions. Use custom hooks to share stateful logic between components. Always handle dependencies correctly in useEffect to prevent infinite loops.",
    tags: [
      { _id: "1", name: "React" },
      { _id: "5", name: "Hooks" }
    ],
    author: {
      _id: "4",
      name: "Sarah Williams",
      image:
        "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg"
    },
    upvotes: 25,
    downvotes: 1,
    answers: 10,
    views: 250,
    createdAt: new Date("2021-07-20")
  },
  {
    _id: "5",
    title: "How to handle state management in React?",
    description: "What are different ways to manage state in React applications?",
    content:
      "There are several approaches to state management in React: local component state using useState, Context API for prop drilling, Redux for complex global state, and newer alternatives like Zustand or Recoil. Choose based on your application complexity and team preferences.",
    tags: [
      { _id: "1", name: "React" },
      { _id: "6", name: "StateManagement" }
    ],
    author: {
      _id: "5",
      name: "Alex Turner",
      image:
        "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg"
    },
    upvotes: 30,
    downvotes: 2,
    answers: 12,
    views: 320,
    createdAt: new Date("2021-06-10")
  }
]
