// frontend/src/services/api.js
import client from "./httpClient";

// ===================== AUTH =====================
export const auth = {
  login: async (userId, password) => {
    // userId is Enrollment Number or Employee ID
    const response = await client.post("/token/", {
      user_id: userId, // Send as user_id, not username
      password,
    });

    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("auth_session", "1");
    }
    return response.data;
  },

  // Register a new student account
  register: async (formData) => {
    const response = await client.post("/register/", formData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await client.get("/me/");
    return response.data;
  },

  // Resend verification email for unverified users. Accepts either a payload object or separate args.
  requestVerification: async (userIdOrPayload, email) => {
    const payload =
      typeof userIdOrPayload === "object" && userIdOrPayload !== null
        ? userIdOrPayload
        : {
            ...(userIdOrPayload ? { user_id: userIdOrPayload } : {}),
            ...(email ? { email } : {}),
          };

    return client.post("/resend-verification/", payload);
  },

  refreshToken: () => client.post("/token/refresh/", {}),

  verifyEmail: async (uidb64, token) => {
    const response = await client.get(`/verify-email/${uidb64}/${token}/`);
    return response.data;
  },
};

// ===================== PROFILE =====================
export const profile = {
  get: () => client.get("/profile/"),

  update: (data) => client.post("/profile/", data),
};

// ===================== DASHBOARD =====================
export const dashboard = {
  getStats: () => client.get("/me/dashboard/"),

  getBorrowedBooks: () => client.get("/circulation/loans/"),

  getFines: () => client.get("/billing/fines/"),

  getNotifications: () => client.get("/notifications/notifications/"),
};

// ===================== CATALOG =====================
export const catalog = {
  getBooks: () => client.get("/catalog/books/"),

  getWishlist: () => client.get("/catalog/wishlist/"),
};
