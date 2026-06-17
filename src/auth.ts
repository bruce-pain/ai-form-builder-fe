import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

function decodeJwtExp(token: string): number {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    );
    return payload.exp as number;
  } catch {
    return 0;
  }
}

async function refreshAccessToken(token: any): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
} | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/token/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: token.refreshToken }),
      },
    );

    if (!res.ok) return null;

    const json = await res.json();
    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresAt: decodeJwtExp(json.access_token),
    };
  } catch {
    return null;
  }
}

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
        token.expiresAt = decodeJwtExp(user.accessToken);
        token.id = user.id;
        token.email = user.email;
        return token;
      }

      if (!token.expiresAt && token.accessToken) {
        token.expiresAt = decodeJwtExp(token.accessToken);
      }

      if (token.expiresAt && Date.now() / 1000 >= token.expiresAt - 60) {
        const refreshed = await refreshAccessToken(token);
        if (refreshed) {
          token.accessToken = refreshed.accessToken;
          token.refreshToken = refreshed.refreshToken;
          token.expiresAt = refreshed.expiresAt;
        } else {
          token.accessToken = null;
          token.refreshToken = null;
        }
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
