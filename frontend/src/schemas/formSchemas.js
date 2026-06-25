import { z } from 'zod'

// ===== LOGIN FORM =====
export const loginSchema = z.object({
  // enrollmentNumber field
  enrollmentNumber: z
    .string()
    .min(1, 'Enrollment number or Employee ID is required') 
    .min(4, 'Must be at least 4 characters') 
    .max(50, 'Must be at most 50 characters') 
    .regex(/^[a-zA-Z0-9-_]+$/, 'Only letters, numbers, hyphens, and underscores allowed'),
  
  // password field
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
})

// ===== SIGNUP FORM =====
export const signupSchema = z.object({
  student_name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),

  user_id: z
    .string()
    .min(1, 'Enrollment number is required')
    .min(4, 'Must be at least 4 characters')
    .max(10, 'Must be at most 10 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Only letters and numbers allowed'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),

  phone_number: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[0-9]{10}$/, 'Phone must be exactly 10 digits'),

  department: z
    .string()
    .optional()
    .default(''),

  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),

  password2: z
    .string()
    .min(1, 'Confirm password is required')
    .min(8, 'Must be at least 8 characters'),
})
// Custom validation: Check if passwords match
.refine(
  (data) => data.password === data.password2,
  {
    message: 'Passwords do not match',
    path: ['password2'] // Show error on this specific field
  }
)


// ===== LEND/RETURN MODAL FORM =====
export const lendReturnSchema = z.object({
  enrollmentId: z
    .string()
    .min(1, 'Enrollment ID is required')
    .min(4, 'Must be at least 4 characters')
    .max(10, 'Must be at most 10 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Only letters and numbers allowed'),
  
  isbn: z
    .string()
    .min(1, 'ISBN is required'),
  
  bookId: z
    .string()
    .min(1, 'Book ID is required')
    .regex(/^[0-9]+$/, 'Book ID must contain only numbers'),
  
  authorName: z
    .string()
    .optional() // This field is optional
    .default(''), // Default empty string if not provided
  
  issueDate: z
    .string()
    .min(1, 'Issue date is required'),
  
  dueDate: z
    .string()
    .min(1, 'Due date is required'),
  
  returnDate: z
    .string()
    .optional()
    .default('')
})

// ===== ADD ORGANISATION MODAL FORM =====
export const addOrganisationSchema = z.object({
  name: z
    .string()
    .min(1, 'Organisation name is required')
    .min(2, 'Name must be at least 2 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Can only contain letters and spaces'),
  
  users: z
    .string()
    .min(1, 'Number of users is required')
    .regex(/^[0-9]+$/, 'Must be a number'),
  
  books: z
    .string()
    .min(1, 'Number of books is required')
    .regex(/^[0-9k]+$/, 'Invalid format (use numbers or "k" for thousands)')
})