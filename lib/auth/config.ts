import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { refreshStravaToken } from "@/lib/strava/token";

const STRAVA_AUTHORIZATION_URL = "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";

export const authConfig: NextAuthConfig = {
  providers: [
    // Strava custom OAuth2 provider
    {
      id: "strava",
      name: "Strava",
      type: "oauth",
      authorization: {
        url: STRAVA_AUTHORIZATION_URL,
        params: {
          scope: "activity:read",
          response_type: "code",
          approval_prompt: "auto",
        },
      },
      token: STRAVA_TOKEN_URL,
      userinfo: "https://www.strava.com/api/v3/athlete",
      clientId: process.env.STRAVA_CLIENT_ID,
      clientSecret: process.env.STRAVA_CLIENT_SECRET,
      profile(profile) {
        return {
          id: String(profile.id),
          name: `${profile.firstname} ${profile.lastname}`.trim(),
          email: profile.email ?? null,
          image: profile.profile ?? null,
        };
      },
    },
    // Admin credentials provider
    Credentials({
      id: "credentials",
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const username = credentials.username as string;
        const password = credentials.password as string;

        if (username !== process.env.ADMIN_USERNAME) return null;

        const hash = process.env.ADMIN_PASSWORD_HASH;
        if (!hash) return null;

        const valid = await bcrypt.compare(password, hash);
        if (!valid) return null;

        return {
          id: "admin",
          name: "Admin",
          email: null,
          role: "admin" as const,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // Initial sign-in
      if (account && profile) {
        if (account.provider === "strava") {
          const stravaAthleteId = String((profile as unknown as { id: number }).id);

          token.accessToken = account.access_token ?? null;
          token.refreshToken = account.refresh_token ?? null;
          token.expiresAt = account.expires_at ?? null;
          token.stravaAthleteId = stravaAthleteId;
          token.role = "participant";

          // Look up runner by Strava athlete ID
          const runner = await prisma.runner.findUnique({
            where: { stravaAthleteId },
          });
          token.runnerId = runner?.id ?? null;

          // Upsert StravaToken if runner found
          if (runner) {
            await prisma.stravaToken.upsert({
              where: { runnerId: runner.id },
              create: {
                runnerId: runner.id,
                accessToken: account.access_token!,
                refreshToken: account.refresh_token!,
                expiresAt: new Date((account.expires_at ?? 0) * 1000),
              },
              update: {
                accessToken: account.access_token!,
                refreshToken: account.refresh_token!,
                expiresAt: new Date((account.expires_at ?? 0) * 1000),
              },
            });
          }
        }
      }

      if (account?.provider === "credentials" && user) {
        token.role = "admin";
        token.runnerId = null;
      }

      // Refresh Strava token when it's within 5 minutes of expiry
      if (
        token.role === "participant" &&
        token.refreshToken &&
        typeof token.expiresAt === "number" &&
        token.expiresAt < Date.now() / 1000 - 300
      ) {
        try {
          const refreshed = await refreshStravaToken(token.refreshToken as string);
          token.accessToken = refreshed.access_token;
          token.refreshToken = refreshed.refresh_token;
          token.expiresAt = refreshed.expires_at;

          // Persist updated tokens to DB if we know the runner
          if (token.runnerId) {
            await prisma.stravaToken.upsert({
              where: { runnerId: token.runnerId as string },
              create: {
                runnerId: token.runnerId as string,
                accessToken: refreshed.access_token,
                refreshToken: refreshed.refresh_token,
                expiresAt: new Date(refreshed.expires_at * 1000),
              },
              update: {
                accessToken: refreshed.access_token,
                refreshToken: refreshed.refresh_token,
                expiresAt: new Date(refreshed.expires_at * 1000),
              },
            });
          }
        } catch (err) {
          console.error("[Strava token refresh] Failed:", err);
          // Return token as-is; let downstream handle expired access token
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.runnerId = token.runnerId ?? null;
      session.user.role = token.role ?? null;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
