/**
 * Token Management Utilities
 * Access token is kept in memory only (not persisted in storage).
 */

let accessToken: string | null = null;

export class TokenManager {
  static getAccessToken(): string | null {
    return accessToken;
  }

  static setAccessToken(token: string): void {
    accessToken = token;
  }

  static clearTokens(): void {
    accessToken = null;
  }

  static hasAccessToken(): boolean {
    return !!accessToken;
  }

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

  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return false;

    const expirationTime = (decoded.exp as number) * 1000;
    return Date.now() >= expirationTime;
  }
}