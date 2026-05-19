import { describe, it, expect } from "vitest";
import { getErrorMessage, getFieldErrors } from "../use-api-error";
import { ApiError } from "@/lib/api/client";

describe("getErrorMessage", () => {
  it("should return detail from ApiError", () => {
    const error = new ApiError({ status: 400, detail: "Bad request" });
    expect(getErrorMessage(error)).toBe("Bad request");
  });

  it("should return joined violation messages for validation errors", () => {
    const error = new ApiError({
      status: 400,
      detail: "Validation failed",
      violations: [
        { field: "email", message: "Email invalide" },
        { field: "nom", message: "Nom requis" },
      ],
    });
    expect(getErrorMessage(error)).toBe("Email invalide, Nom requis");
  });

  it("should return message from regular Error", () => {
    const error = new Error("Something went wrong");
    expect(getErrorMessage(error)).toBe("Something went wrong");
  });

  it("should return default message for unknown errors", () => {
    expect(getErrorMessage("random")).toBe(
      "Une erreur inattendue est survenue",
    );
    expect(getErrorMessage(null)).toBe("Une erreur inattendue est survenue");
  });
});

describe("getFieldErrors", () => {
  it("should return field errors from ApiError violations", () => {
    const error = new ApiError({
      status: 400,
      detail: "Validation failed",
      violations: [
        { field: "email", message: "Email invalide" },
        { field: "nom", message: "Nom requis" },
      ],
    });
    expect(getFieldErrors(error)).toEqual({
      email: "Email invalide",
      nom: "Nom requis",
    });
  });

  it("should return empty object for non-ApiError", () => {
    expect(getFieldErrors(new Error("test"))).toEqual({});
  });

  it("should return empty object for ApiError without violations", () => {
    const error = new ApiError({ status: 500, detail: "Server error" });
    expect(getFieldErrors(error)).toEqual({});
  });
});
