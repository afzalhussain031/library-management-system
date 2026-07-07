/**
 * Extracts the first letter of the first name and the first letter of the last name.
 * Examples:
 * - "John Doe" -> "JD"
 * - "Alice" -> "A"
 * - "Robert Downey Junior" -> "RD"
 * 
 * @param {string} name - The full name of the user.
 * @returns {string} The extracted initials in uppercase.
 */
export const getUserInitials = (name) => {
  if (!name) return "?";
  
  // Split the name by spaces, filtering out any extra spaces
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  // Take the first letter of the first word and the first letter of the last word
  const firstInitial = parts[0].charAt(0);
  const lastInitial = parts[parts.length - 1].charAt(0);
  
  return (firstInitial + lastInitial).toUpperCase();
};

