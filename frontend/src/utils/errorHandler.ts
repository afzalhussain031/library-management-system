/**
 * Error Handling Utilities
 * Centralized error handling logic for consistent error processing
 */

import axios from "axios";
import { ERROR_MESSAGES } from "../constants";

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
