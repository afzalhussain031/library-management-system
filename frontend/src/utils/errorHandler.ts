/**
 * Error Handling Utilities
 * Centralized error handling logic for consistent error processing
 */

import axios from "axios";
import { ERROR_MESSAGES } from "../constants";
import type { AuthFieldErrors } from "../types";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  user_not_found: "Your session is no longer valid. Please sign in again.",
  "user not found": "Your session is no longer valid. Please sign in again.",
  no_active_account: "Invalid username or password.",
  "no active account found with the given credentials": "Invalid username or password.",
  user_inactive: "Your account is inactive. Contact the administrator.",
  "user is inactive": "Your account is inactive. Contact the administrator.",
};

const normalizeErrorKey = (value: unknown): string => 
  String(value || "")
  .trim()
  .toLowerCase();

const toFriendlyAuthMessage = (
  message: unknown,
  code?: unknown,
): string | undefined => {
  const codeKey = normalizeErrorKey(code);
  if (codeKey && AUTH_ERROR_MESSAGES[codeKey]) {
    return AUTH_ERROR_MESSAGES[codeKey];
  }

  const messageKey = normalizeErrorKey(message);
  if (messageKey && AUTH_ERROR_MESSAGES[messageKey]) {
    return AUTH_ERROR_MESSAGES[messageKey];
  }

  return undefined;
};


export class AppError extends Error {
  public statusCode: number;
  public details: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    details: unknown = null,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = "AppError";
  }
}

/**
 * Extract error message from various error sources
 * Handles:
 * - Axios errors with response data
 * - Standard Error objects
 * - Unknown error types
 */
export const handleError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Try to extract server error message
    const data = error.response?.data;
    if (data) {
      if (typeof data === "object" && !Array.isArray(data)) {
        const payload = data as Record<string, unknown>;
        const friendly = toFriendlyAuthMessage(
          payload.detail || payload.message,
          payload.code,
        );
        if (friendly){
          return friendly;
        }
      }

      // DRF returns validation errors with field names
      if (typeof data === "object" && !Array.isArray(data)) {
        const messages = Object.values(data)
          .map((v) => {
            if (Array.isArray(v)) return v.join(", ");
            if (typeof v === "object") return JSON.stringify(v);
            return String(v);
          })
          .filter(Boolean);
        if (messages.length > 0) return messages.join(". ");
      }

      // Check for common error fields
      if ("detail" in data) return String(data.detail);
      if ("message" in data) return String(data.message);

      // Fallback to stringified data
      return JSON.stringify(data);
    }

    // Fallback to axios error message
    return error.message || ERROR_MESSAGES.GENERIC;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return ERROR_MESSAGES.GENERIC;
};

/**
 * Check if error is due to authentication failure
 * Used to determine if user should be logged out
 */
export const isAuthError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 401 || error.response?.status === 403;
  }
  return false;
};

/**
 * Check if error is a validation error
 * Used to show field-level errors in forms
 */
export const isValidationError = (
  error: unknown,
): error is { [key: string]: string[] } => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    return (
      error.response?.status === 400 &&
      data &&
      typeof data === "object" &&
      !Array.isArray(data)
    );
  }
  return false;
};

const toMessage = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => String(item).trim())
      .filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  if (value == null) {
    return undefined;
  }

  return String(value);
};

export const parseAuthFieldErrors = (error: unknown): AuthFieldErrors => {
  const fieldErrors: AuthFieldErrors = {};

  if (!axios.isAxiosError(error)) {
    return fieldErrors;
  }

  const data = error.response?.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return fieldErrors;
  }

  const payload = data as Record<string, unknown>;

  fieldErrors.username = toMessage(payload.username);
  fieldErrors.email = toMessage(payload.email);
  fieldErrors.password = toMessage(payload.password);
  fieldErrors.password2 = toMessage(payload.password2);

  const nonFieldMessage = 
    toMessage(payload.non_field_errors) ||
    toMessage(payload.detail) ||
    toMessage(payload.message);

  const friendlyMessage = toFriendlyAuthMessage(nonFieldMessage, payload.code);

  if (friendlyMessage) {
    fieldErrors.general = friendlyMessage;
  } else if (nonFieldMessage) {
    fieldErrors.general = nonFieldMessage;
  }

  return fieldErrors;
};

export const isNetworkError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  // Network/CORS/timeout failures usually don't include an HTTP response.
  return !error.response;
};

export const getAuthSubmitError = (
  error: unknown,
): { generalMessage: string; fieldErrors: AuthFieldErrors } => {
  const fieldErrors = parseAuthFieldErrors(error);

  if (isNetworkError(error)) {
    return {
      generalMessage: ERROR_MESSAGES.NETWORK,
      fieldErrors,
    };
  }

  return {
    generalMessage: fieldErrors.general || handleError(error) || ERROR_MESSAGES.GENERIC,
    fieldErrors,
  };
};
