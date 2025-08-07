
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { api } from "./app/config/api_config";
import Auth0 from "next-auth/providers/auth0"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    accessToken?: string
  }
  interface JWT {
    accessToken?: string
  }
}
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, Auth0({
    authorization:{
      params:{
        prompt: "login"
      }
    }
  })],
  session: {
    strategy: "jwt",

  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user) {
        try {
          await api.post("/users", {
          
            email: user.email,
            name: user.name,
            password: "",
            googleUserId: user.id,
            userType:"google"

          })
          return true
        } catch (error) {
          console.error("Error creating user:", error)
          // Return true to allow sign in even if user creation fails
          // You might want to handle this differently based on your needs
          return true
        }
      }
      return false
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      if (user) {
        token.id = user.id
        token.sub = account?.userId
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken as string
      if (token.id) {
        session.user.id = token.id as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      return "/home"; // redirect after login
    },
  }
})

