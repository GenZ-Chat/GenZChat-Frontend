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
    refreshToken?: string
  }
}

function formatUserId(userId:string){
  const parts = userId.split("|");
  const id = parts[1];
  const type = parts[0] === "auth0" ? "email" : parts[0] === "google-oauth2" ? "google" : "unknown"; // Assuming the first part is the type
  return { type, id }
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
          console.log(account?.id_token)
          console.log(account?.access_token)
       
          const { id, type } = formatUserId(profile?.sub!);
             account!.userId = id
          const existingUser = await api.get(`/users/auth0/${id}`);
          if (existingUser.data) {
            account!.userId = existingUser.data._id
          }else{
          const createdUser = await api.post("/users", {
            email: user.email,
            name: user.name,
            auth0Id: id,
            userType: type
          })
        
          account!.userId = createdUser.data._id
          }
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
    async jwt({ token, user, account, profile }) {
      //customizing jwt tokens and syncing with auth0 tokens
        console.log("account_user_id:", account?.userId);
      if (account) {
        token.accessToken = account.access_token
      }
      if (user) {
        token.id = account?.userId
        token.sub = account?.userId
      }
      return token
    },

    async session({ session, token }) {
      //customizing session object
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

