import { ZodError } from "zod";
import { NextResponse } from "next/server";

export type ApiErrorResponse = {
  error: string;
  issues?: Array<{ path: string; message: string }>;
};

export type ApiSuccessResponse<T> = T;

/**
 * Format a ZodError into a consistent API error shape.
 */
export function formatZodError(error: ZodError): ApiErrorResponse {
  return {
    error: "Validation failed",
    issues: error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  };
}

/**
 * Return a typed 400 JSON response for validation errors.
 */
export function validationError(error: ZodError): NextResponse<ApiErrorResponse> {
  return NextResponse.json(formatZodError(error), { status: 400 });
}

/**
 * Return a typed 404 JSON response.
 */
export function notFound(message = "Not found"): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: message }, { status: 404 });
}

/**
 * Return a typed 401 JSON response.
 */
export function unauthorized(message = "Unauthorized"): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Return a typed 403 JSON response.
 */
export function forbidden(message = "Forbidden"): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Return a typed 409 JSON response (conflict).
 */
export function conflict(message: string): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: message }, { status: 409 });
}

/**
 * Return a typed 500 JSON response.
 */
export function internalError(message = "Internal server error"): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Return a typed 502 JSON response (bad gateway — upstream API error).
 */
export function badGateway(message = "Upstream service unavailable"): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: message }, { status: 502 });
}

/**
 * Custom error class for Strava API errors.
 */
export class StravaApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "StravaApiError";
  }
}
