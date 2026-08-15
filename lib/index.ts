export * from "./http-error"
export * from "./mongoose"
export * from "./url"
export * from "./validation"
export * from "./handlers"
export * from "./utils"
export * from "./api"
export * from "./logger"

// ✅ Add this consolidated export to satisfy `import { api } from "@/lib"` in auth.ts
import { usersApi, accountsApi, authApi } from "./api"

export const api = {
  users: usersApi,
  accounts: accountsApi,
  auth: authApi
}
