import { describe, it, expect } from "vitest";
import { ResultSchema } from "@/lib/validation/schemas";

describe("ResultSchema", () => {
  it("accepts valid result payload", () => {
    const result = ResultSchema.safeParse({
      stageId: "stage-uuid-123",
      elapsedSeconds: 3600,
      stravaActivityId: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing stageId", () => {
    const result = ResultSchema.safeParse({
      elapsedSeconds: 3600,
    });
    expect(result.success).toBe(false);
  });

  it("rejects elapsedSeconds of 0", () => {
    const result = ResultSchema.safeParse({
      stageId: "stage-uuid-123",
      elapsedSeconds: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative elapsedSeconds", () => {
    const result = ResultSchema.safeParse({
      stageId: "stage-uuid-123",
      elapsedSeconds: -100,
    });
    expect(result.success).toBe(false);
  });

  it("accepts result without optional stravaActivityId", () => {
    const result = ResultSchema.safeParse({
      stageId: "stage-uuid-123",
      elapsedSeconds: 1800,
    });
    expect(result.success).toBe(true);
  });
});
