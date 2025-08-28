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
      issuer: process.env.AUTH_AUTH0_ISSUER,
      clientId: process.env.AUTH_AUTH0_ID!,
      clientSecret: process.env.AUTH_AUTH0_SECRET!,
      authorization:{
        params:{
          prompt: "login"
        }
      }
  
  })],
  secret: process.env.AUTH_SECRET,

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
          console.log("Formatted ID:", id, "Type:", type);
          // Check if user already exists
          let existingUser;
          try {
            existingUser = await api.get(`/users/auth0/${id}`);
            console.log("existingUser:", existingUser.data);
            if (existingUser.data) {
              account!.userId = existingUser.data._id;
              return true;
            }
          } catch (err: any) {
            if (err.response && err.response.status === 404) {
              // User not found, proceed to create
              const createdUser = await api.post("/users", {
                email: user.email,
                name: user.name,
                auth0Id: id,
                userType: type
              });
              account!.userId = createdUser.data._id;
              return true;
            } else {
              // Other errors
              console.error("Error checking user existence:", err);
              return true;
            }
          }
        } catch (error) {
          console.error("Error creating user:", error);
          // Return true to allow sign in even if user creation fails
          return true;
        }
      }
      return false;
    },
    async jwt({ token, user, account, profile }) {
      //customizing jwt tokens and syncing with auth0 tokens
      console.log("account_user_id:", account?.userId);
      if (account) {
        token.accessToken = account.access_token;
      }
      // Always persist the user id on the token
      if (account?.userId) {
        token.id = account.userId;
        token.sub = account.userId;
      } else if (!token.id && user) {
        // fallback for first sign in if userId is not set
        token.id = user.id;
        token.sub = user.id;
      }
      return token;
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

