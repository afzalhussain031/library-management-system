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

// Profile form constants
export const PROFILE_CONSTRAINTS = {
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 150,
  MAX_BIO_LENGTH: 500,
};

// Profile form validation
export interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
}
