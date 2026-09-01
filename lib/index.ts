export * from "./http-error"
export * from "./url"
export * from "./validation"
export * from "./handlers"
export * from "./utils"
export * from "./api"
export * from "./logger"
export * from "./tag-helpers"
export * from "./actions"

// ✅ Add this consolidated export to satisfy `import { api } from "@/lib"` in auth.ts
import { usersApi, accountsApi, authApi } from "./api"

export const api = {
  users: usersApi,
  accounts: accountsApi,
  auth: authApi
}

// Re-export commonly used handler functions
export { HandleError, formatResponse } from "./handlers/errorHandler"
