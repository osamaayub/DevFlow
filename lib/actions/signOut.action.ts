"use server"

import { signOut } from "@/auth"
import ROUTES from "@/constants/route"

export async function logout() {
  await signOut({ redirectTo: ROUTES.HOME })
}
