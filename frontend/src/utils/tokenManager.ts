/**
 * Token Management Utilities
 * Handles JWT token storage, retrieval, and validation
 */

import { STORAGE_KEYS } from "../constants";

export class TokenManager {
  /**
   * Get the access token from localStorage
   */
  static getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get the refresh token from localStorage
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Set both access and refresh tokens in localStorage
   */
  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  /**
   * Update only the access token
   */
  static setAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  /**
   * Clear all tokens from localStorage
   */
  static clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Check if an access token exists
   */
  static hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Check if a refresh token exists
   */
  static hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }

  /**
   * Decode JWT token (basic implementation, doesn't verify signature)
   * WARNING: This doesn't validate the token signature. Use only to extract payload.
   */
  static decodeToken(token: string): Record<string, unknown> | null {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Failed to decode token:", err);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return false;

    const expirationTime = (decoded.exp as number) * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  }
}
