"use server"

import { signOut } from "@/auth"
import { redirect } from "next/navigation"

export async function logoutAction() {
  try {
    // Server-side signout using NextAuth
    await signOut({ 
      redirectTo: "/auth",
      redirect: false // We'll handle redirect manually
    })
  } catch (error) {
    console.error("Server-side logout error:", error)
  }
  
  // Force redirect after logout
  redirect("/auth")
}
