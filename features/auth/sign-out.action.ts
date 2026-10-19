"use server"

import { signOut } from "@/server/auth"
import ROUTES from "@/shared/constants/route"

export async function logout() {
  await signOut({ redirectTo: ROUTES.HOME })
}
