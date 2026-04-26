import { z } from "zod";

// Stage type enum
export const StageTypeSchema = z.enum(["FLAT", "HILLY", "MIXED"]);

// Strava embed URL pattern
const STRAVA_EMBED_PATTERN =
  /^https:\/\/www\.strava\.com\/(routes|segments)\/\d+\/embed$/;

export const StageSchema = z.object({
  stageNumber: z.number().int().min(1).max(8),
  name: z.string().min(1).max(120),
  date: z.coerce.date(),
  startLocation: z.string().min(1).max(200),
  endLocation: z.string().min(1).max(200),
  distanceKm: z.number().positive(),
  elevationDescription: z.string().max(500).nullable().optional(),
  stageType: StageTypeSchema,
  description: z.string().max(2000).nullable().optional(),
  stravaEmbedUrl: z
    .string()
    .regex(STRAVA_EMBED_PATTERN, { message: "Must be a valid Strava route or segment embed URL" })
    .nullable()
    .optional(),
});

export const TeamSchema = z.object({
  name: z.string().min(1).max(60),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Must be a valid hex color code (#RRGGBB)" }),
  logoUrl: z.string().url().nullable().optional(),
});

export const RunnerSchema = z.object({
  name: z.string().min(1).max(120),
  teamId: z.string().min(1, { message: "teamId is required" }),
  stravaAthleteId: z.string().nullable().optional(),
  stravaHandle: z.string().max(60).nullable().optional(),
});

export const ResultSchema = z.object({
  stageId: z.string().min(1, { message: "stageId is required" }),
  elapsedSeconds: z.number().int().positive({ message: "elapsedSeconds must be > 0" }),
  stravaActivityId: z.string().min(1).optional(),
});

export const AdminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type StageInput = z.infer<typeof StageSchema>;
export type TeamInput = z.infer<typeof TeamSchema>;
export type RunnerInput = z.infer<typeof RunnerSchema>;
export type ResultInput = z.infer<typeof ResultSchema>;
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
