import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      runnerId?: string | null;
      role?: "admin" | "participant" | null;
    };
  }

  interface User {
    runnerId?: string | null;
    role?: "admin" | "participant" | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    runnerId?: string | null;
    role?: "admin" | "participant" | null;
    accessToken?: string | null;
    refreshToken?: string | null;
    expiresAt?: number | null;
    stravaAthleteId?: string | null;
  }
}

export type { Session, User, JWT };
