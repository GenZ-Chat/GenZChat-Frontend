import NextAuth from "next-auth";
import Auth0 from "next-auth/providers/auth0";
import { api } from "./app/config/api_config";
import { getKeyExchangeForUser, uint8ArrayToBase64 } from "./app/encryption/key_exchange";

// Extend built-in session and JWT types
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    id?: string;
  }
}

// Helper to format Auth0/Google user IDs
function formatUserId(userId: string) {
  const parts = userId.split("|");
  const id = parts[1];
  const type =
    parts[0] === "auth0"
      ? "email"
      : parts[0] === "google-oauth2"
      ? "google"
      : "unknown";
  return { type, id };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Auth0({
      issuer: process.env.AUTH_AUTH0_ISSUER,
      clientId: process.env.AUTH_AUTH0_ID!,
      clientSecret: process.env.AUTH_AUTH0_SECRET!,
      authorization: {
        params: {
          prompt: "login",
          scope: "openid email profile",
        },
      },
      checks: ["state"], // Keep CSRF protection
      wellKnown: `${
        (process.env.AUTH_AUTH0_ISSUER ?? "").replace(/\/$/, "")
      }/.well-known/openid-configuration`,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  useSecureCookies: false, // Set false for dev/localhost

  // Let NextAuth handle state/csrf/session cookies automatically
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
    // Optional callback URL cookie
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  debug: process.env.NODE_ENV === "development",

  callbacks: {
    async signIn({ user, account, profile }) {
      if (user) {
        try {
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
              // User not found, create new
              const createdUser = await api.post("/users", {
                email: user.email,
                name: user.name,
                auth0Id: id,
                userType: type,
              });
              account!.userId = createdUser.data._id;
              return true;
            } else {
              console.error("Error checking user existence:", err);
              return true;
            }
          }
        } catch (error) {
          console.error("Error creating user:", error);
          return true;
        }
      }
      return false;
    },

    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (account?.userId) {
        token.id = account.userId;
        token.sub = account.userId;
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return "/loading";
    },
  },
});
