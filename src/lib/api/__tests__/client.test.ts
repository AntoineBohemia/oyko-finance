import { describe, it, expect } from "vitest";
import { ApiError } from "../client";

describe("ApiError", () => {
  it("should create an ApiError with ProblemDetail", () => {
    const error = new ApiError({
      status: 400,
      detail: "Bad request",
      violations: [{ field: "email", message: "Email invalide" }],
    });

    expect(error.status).toBe(400);
    expect(error.detail).toBe("Bad request");
    expect(error.message).toBe("Bad request");
    expect(error.name).toBe("ApiError");
    expect(error.violations).toHaveLength(1);
  });

  it("should detect unauthorized errors", () => {
    const error = new ApiError({ status: 401, detail: "Unauthorized" });
    expect(error.isUnauthorized).toBe(true);
    expect(error.isNotFound).toBe(false);
  });

  it("should detect not found errors", () => {
    const error = new ApiError({ status: 404, detail: "Not found" });
    expect(error.isNotFound).toBe(true);
    expect(error.isUnauthorized).toBe(false);
  });

  it("should detect validation errors", () => {
    const error = new ApiError({
      status: 400,
      detail: "Validation failed",
      violations: [{ field: "nom", message: "Nom requis" }],
    });
    expect(error.isValidationError).toBe(true);
  });

  it("should not be validation error without violations", () => {
    const error = new ApiError({ status: 400, detail: "Bad request" });
    expect(error.isValidationError).toBe(false);
  });
});
