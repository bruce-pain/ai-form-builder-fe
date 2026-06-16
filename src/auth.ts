import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          },
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message ?? "Invalid credentials");
        }

        return {
          id: json.data.id,
          email: json.data.email,
          accessToken: json.access_token,
          refreshToken: json.refresh_token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.id = token.id;
      session.user.email = token.email;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
