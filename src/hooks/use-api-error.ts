import { ApiError } from "@/lib/api/client";

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isValidationError && error.violations?.length) {
      return error.violations.map((v) => v.message).join(", ");
    }
    return error.detail;
  }
  if (error instanceof Error) return error.message;
  return "Une erreur inattendue est survenue";
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof ApiError && error.violations?.length) {
    return Object.fromEntries(
      error.violations.map((v) => [v.field, v.message]),
    );
  }
  return {};
}
