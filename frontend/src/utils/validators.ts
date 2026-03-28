import type { AuthFieldErrors, AuthFormValues } from "../types";

const MAX_USERNAME_LENGHT = 150;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type PasswordStrengthLabel = "Very weak" | "Weak" | "Medium" | "Strong";

const getPasswordScore = (password: string): number => {
    let score = 0;

    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    return score;
};

export const getPasswordStrength = (
    password: string,
): {score: number; label: PasswordStrengthLabel} => {
    const score = getPasswordScore(password);

    if (score <= 1) {
        return {score, label: "Very weak"};
    }

    if (score === 2) {
        return {score, label: "Weak"};
    }

    if (score <=4) {
        return {score, label: "Medium"}
    }

    return {score, label: "Strong"}
};

export const getPasswordGuidance = (password: string): string[] => {
    const guidance: string[] = []

    if (!password) {
        return [
            "Use at least 8 characters",
            "Add uppercase and lowercase letters",
            "Include a number and a symbol",
        ];
    }

    if (password.length < 8) guidance.push("Use at least 8 characters");
    if (!/[a-z]/.test(password)) guidance.push("Add a lowercase letter");
    if (!/[A-Z]/.test(password)) guidance.push("Add an uppercase letter");
    if (!/[0-9]/.test(password)) guidance.push("Include at least one number");
    if (!/[^A-Za-z0-9]/.test(password)) guidance.push("Include at least one symbol");

    return guidance;
};

export const validateUsername = (username: string): string | undefined => {
    const value = username.trim();

    if (!value) return "Username is required";
    if (value.length > MAX_USERNAME_LENGHT) {
        return `Usernam must be at most ${MAX_USERNAME_LENGHT} characters`;
    }
    if (/\s/.test(value)) return "Username must not contain spaces";

    return undefined;
    };

export const validateEmail = (email: string): string | undefined => {
    const value = email.trim()

    if (!value) return undefined
    if (!EMAIL_REGEX.test(value)) return "Please enter a valid email address";
    
    return undefined
};

export const validatePasswordRequired = (password: string): string | undefined => {
  if (!password) return "Password is required";
  return undefined;
};


export const validatePasswordConfirmation = (
    password: string,
    password2: string,
) : string | undefined => {
    if (!password2) return "Please confirm your password";
    if (password !== password2) return "Passwords do not match";
    return undefined;
};

export const validateLoginForm = (values: AuthFormValues): AuthFieldErrors => {
    const errors: AuthFieldErrors = {};

    errors.username = validateUsername(values.username)
    errors.password = validatePasswordRequired(values.password);

    return errors;
};

export const validateSignupForm = (values: AuthFormValues): AuthFieldErrors => {
    const errors: AuthFieldErrors = {};

    errors.username = validateUsername(values.username);
    errors.email = validateEmail(values.email);
    errors.password = validatePasswordRequired(values.password)
    errors.password2 = validatePasswordConfirmation(values.password, values.password2);

    return errors;
};

export const validateStaffCreateForm = (
    values: AuthFormValues, 
): AuthFieldErrors => {
    return validateSignupForm(values);
}

export const hasFieldErrors = (errors: AuthFieldErrors): boolean => {
  return Boolean(
    errors.username ||
      errors.email ||
      errors.password ||
      errors.password2,
  );
};

