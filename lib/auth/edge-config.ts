/**
 * Edge-compatible auth configuration for use in middleware.
 * This config does NOT import Prisma or any Node.js-only modules.
 * It only reads from the JWT — writes happen in the full config on sign-in.
 */
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

export const edgeAuthConfig: NextAuthConfig = {
  providers: [], // providers not needed in middleware — only JWT reading
  callbacks: {
    authorized({ auth }) {
      return !!auth;
    },
    async jwt({ token }) {
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

export const { auth } = NextAuth(edgeAuthConfig);
