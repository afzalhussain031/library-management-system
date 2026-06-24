import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema } from '../../schemas/formSchemas'
import { auth } from '../../services/api'
import {
  User, IdCard, Phone, Mail, Building2,
  Lock, KeyRound, Eye, EyeOff,
  AlertCircle, Bell, CheckCircle
} from 'lucide-react'
import signupImage from "../../assets/signup-image.jpg"

// ====== PASSWORD STRENGTH CALCULATOR ======
// Returns a score from 0 to 4 based on password complexity
function getPasswordStrength(password) {
  if (!password) return 0
  let score = 0
  if (password.length >= 6) score++   // Minimum length
  if (password.length >= 10) score++  // Good length
  if (/[A-Z]/.test(password)) score++ // Has uppercase
  if (/[0-9]/.test(password)) score++ // Has numbers
  if (/[^a-zA-Z0-9]/.test(password)) score++ // Has special chars
  return Math.min(score, 4) // Cap at 4
}

// Maps score → label and color
const strengthConfig = {
  0: { label: '', color: '' },
  1: { label: 'Weak', color: 'bg-red-500' },
  2: { label: 'Fair', color: 'bg-orange-400' },
  3: { label: 'Good', color: 'bg-yellow-400' },
  4: { label: 'Strong', color: 'bg-green-500' },
}

// Department options for the dropdown
const DEPARTMENTS = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'Information Technology',
  'Other',
]

export default function SignUp() {
  const navigate = useNavigate()
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  // ====== REACT HOOK FORM SETUP ======
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,  // ← Lets us add backend errors to specific fields
    watch
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  })

  // Watch password field for strength indicator
  const passwordValue = watch('password', '')
  const strength = getPasswordStrength(passwordValue)

  // ====== FORM SUBMISSION ======
  const onSubmit = async (data) => {
    setServerError('')

    try {
      // Send directly — field names already match the backend!
      await auth.register(data)

      // Success! Show banner and redirect
      setShowSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      // Handle backend validation errors
      if (err.response?.data) {
        const backendErrors = err.response.data

        // Since field names are consistent, we can use them directly
        let hasFieldError = false

        Object.entries(backendErrors).forEach(([field, messages]) => {
          const message = Array.isArray(messages) ? messages[0] : messages

          // setError adds the error message directly under the matching input
          // This works because our form field names = backend field names
          setError(field, { type: 'server', message })
          hasFieldError = true
        })

        // Handle non-field errors (e.g., {"detail": "..."})
        if (!hasFieldError) {
          const genericMsg = backendErrors.detail
            || backendErrors.non_field_errors?.[0]
            || 'Registration failed. Please try again.'
          setServerError(genericMsg)
        }
      } else {
        setServerError('Network error. Please check your connection.')
      }
    }
  }

  // ====== HELPER: Render input with error ======
  const renderInput = (fieldName, label, type = 'text', icon = null, extra = {}) => (
    <div>
      <div className="relative">
        {icon}
        <input
          type={type}
          placeholder={label}
          {...register(fieldName)}
          className={`w-full rounded-full border border-gray-200 bg-gray-50 px-5 py-2.5 pl-10 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40 placeholder:text-gray-400 text-gray-800 ${
            errors[fieldName]
              ? 'border-red-500 bg-red-50'
              : ''
          } ${extra.className || ''}`}
          disabled={isSubmitting}
          autoFocus={extra.autoFocus || false}
        />
        {/* Password toggle button (only rendered if provided) */}
        {extra.toggleButton}
      </div>
      {errors[fieldName] && (
        <p className="text-xs text-red-600 mt-1.5">{errors[fieldName].message}</p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[1300px] bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[700px]">

        {/* ══════════════════════════════════════════════════════════
            LEFT PANEL: Image (unchanged from your original)
            ══════════════════════════════════════════════════════════ */}
        <div className="relative w-full lg:w-[52%] overflow-hidden min-h-[300px]">
          <img
            src={signupImage}
            alt="Library"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/65" />

          <div className="absolute top-6 left-6 bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-medium px-5 py-2 rounded-full">
            LibraryHub
          </div>

          <div className="absolute top-6 right-6 bg-white rounded-2xl p-3 w-48 shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
              <p className="text-xs font-semibold text-gray-800">New Book Available</p>
            </div>
            <p className="text-[11px] text-gray-400">Design Patterns · Added today</p>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex gap-3">
            {[
              { value: '12k+', label: 'Books available' },
              { value: '3.2k', label: 'Active members' },
              { value: '98%', label: 'Happy readers', accent: true },
            ].map((s) => (
              <div
                key={s.label}
                className={`flex-1 rounded-xl p-3 backdrop-blur-md border ${
                  s.accent
                    ? 'bg-yellow-400/20 border-yellow-400/40'
                    : 'bg-white/10 border-white/20'
                }`}
              >
                <p className={`text-lg font-semibold ${s.accent ? 'text-yellow-400' : 'text-white'}`}>
                  {s.value}
                </p>
                <p className="text-[11px] text-white/60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RIGHT PANEL: Signup Form
            ══════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-[48%] bg-white flex items-center justify-center px-8 py-12 lg:px-14 overflow-y-auto max-h-screen">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-semibold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-400 mt-1 mb-8">Join LibraryHub today</p>

            {/* Success message */}
            {showSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-600 rounded-2xl px-4 py-3 mb-5 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Registration successful! Redirecting to login...
              </div>
            )}

            {/* Server-level error (non-field errors) */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 mb-5 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {serverError}
              </div>
            )}

            {/* ============ FORM STARTS HERE ============ */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              
              {/* Full Name — auto-focused */}
              {renderInput('student_name', 'Full Name', 'text', 
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />,
                { autoFocus: true }
              )}

              {/* Enrollment Number */}
              {renderInput('user_id', 'Enrollment Number', 'text',
                <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              )}

              <div className="flex gap-3">
                {/* Email */}
                <div className="flex-1">
                  {renderInput('email', 'Email', 'email',
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  )}
                </div>

                {/* Phone Number */}
                <div className="flex-1">
                  {renderInput('phone_number', 'Phone Number', 'tel',
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Department Dropdown */}
              <div>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    {...register('department')}
                    className={`w-full rounded-full border border-gray-200 bg-gray-50 px-5 py-2.5 pl-10 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40 text-gray-800 appearance-none cursor-pointer ${
                      errors.department ? 'border-red-500 bg-red-50' : ''
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="">Select Department (Optional)</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                {errors.department && (
                  <p className="text-xs text-red-600 mt-1.5">{errors.department.message}</p>
                )}
              </div>

              <div className="flex gap-3">
                {/* Password with show/hide toggle */}
                <div className="flex-1">
                  {renderInput('password', 'Password', showPassword ? 'text' : 'password',
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />,
                    {
                      className: 'pr-10',
                      toggleButton: (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                          tabIndex={-1}
                        >
                          {showPassword
                            ? <EyeOff className="w-4 h-4" />
                            : <Eye className="w-4 h-4" />
                          }
                        </button>
                      )
                    }
                  )}
                </div>

                {/* Confirm Password with show/hide toggle */}
                <div className="flex-1">
                  {renderInput('password2', 'Confirm Password', showConfirmPassword ? 'text' : 'password',
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />,
                    {
                      className: 'pr-10',
                      toggleButton: (
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                          tabIndex={-1}
                        >
                          {showConfirmPassword
                            ? <EyeOff className="w-4 h-4" />
                            : <Eye className="w-4 h-4" />
                          }
                        </button>
                      )
                    }
                  )}
                </div>
              </div>

              {/* Password Strength Bar */}
              {passwordValue && (
                <div className="px-1">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          strength >= level
                            ? strengthConfig[strength].color
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 ${
                    strength <= 1 ? 'text-red-500' :
                    strength === 2 ? 'text-orange-400' :
                    strength === 3 ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {strengthConfig[strength].label}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-200 disabled:text-gray-400 active:scale-[0.98] transition-all duration-200 py-3 rounded-full text-sm font-semibold text-gray-900"
              >
                {isSubmitting ? 'Creating Account...' : 'Register'}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-gray-400">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="text-gray-900 font-semibold hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
