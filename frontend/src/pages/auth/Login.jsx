import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../../schemas/formSchemas'
import { useAuth } from '../../context/AuthContext'
import { IdCard, Lock, AlertCircle, BookOpen, GraduationCap } from 'lucide-react'
import loginImage from "../../assets/signup-image.jpg"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  // ====== REACT HOOK FORM SETUP ======
  // This connects the form to Zod validation
  const {
    register,        // Function to connect input fields
    handleSubmit,    // Wrapper function for form submission
    formState: { 
      errors,        // Object containing all field errors
      isSubmitting   // Boolean: true when submitting (loading state)
    },
    setError         // Function to manually set field errors
  } = useForm({
    resolver: zodResolver(loginSchema), // Use Zod schema for validation
    mode: 'onSubmit', // Only validate for the first time when the user clicks submit
    reValidateMode: 'onChange' // Clear errors instantly as the user types
  })


  // ====== FORM SUBMISSION HANDLER ======
  const handleFormSubmit = async (data) => {
    try {
      // data is ALREADY validated by Zod at this point
      // data = { enrollmentNumber: "...", password: "..." }
      
      const user = await login(data.enrollmentNumber, data.password)
      
      // Route based on user role
      if (user?.role === 'superadmin') {
        navigate('/superadmin/dashboard')
      } else if (user?.role === 'staff' || user?.role === 'librarian') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      // If API call fails, show error as a general form error
      setError('root', {
        message: 'Invalid enrollment number or password'
      })
    }
  }

  const inputClass =
    "w-full rounded-full border border-gray-200 bg-gray-50 px-5 py-3 pl-10 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40 placeholder:text-gray-400 text-gray-800 disabled:opacity-60"

  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[1100px] bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[600px]">

        {/* ══════════════════════════════════════════════════════════
            LEFT PANEL: Image with decorations (unchanged)
            ══════════════════════════════════════════════════════════ */}
        <div className="relative w-full lg:w-[52%] overflow-hidden min-h-[300px]">
          <img
            src={loginImage}
            alt="Library"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/65" />

          {/* Brand pill */}
          <div className="absolute top-6 left-6 bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-medium px-5 py-2 rounded-full">
            LibraryHub
          </div>

          {/* Floating card */}
          <div className="absolute top-6 right-6 bg-white rounded-2xl p-3 w-48 shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
              <p className="text-xs font-semibold text-gray-800">Today's Returns</p>
            </div>
            <p className="text-[11px] text-gray-400">14 books due today</p>
          </div>

          {/* Stats strip */}
          <div className="absolute bottom-6 left-6 right-6 flex gap-3">
            {[
              { value: '12k+', label: 'Books available' },
              { value: '3.2k', label: 'Active members' },
              { value: '98%', label: 'Happy readers', accent: true },
            ].map((s) => (
              <div
                key={s.label}
                className={[
                  'flex-1 rounded-xl p-3 backdrop-blur-md border',
                  s.accent
                    ? 'bg-yellow-400/20 border-yellow-400/40'
                    : 'bg-white/10 border-white/20'
                ].join(' ')}
              >
                <p className={s.accent ? 'text-lg font-semibold text-yellow-400' : 'text-lg font-semibold text-white'}>
                  {s.value}
                </p>
                <p className="text-[11px] text-white/60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RIGHT PANEL: Login Form
            ══════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-[48%] bg-white flex items-center justify-center px-8 py-12 lg:px-14">
          <div className="w-full max-w-sm">

            <h2 className="text-2xl font-semibold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-400 mt-1 mb-8">
              Sign in to your LibraryHub account
            </p>

            {/* ============ FORM STARTS HERE ============ */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
              
              {/* ════════════════════════════════════════
                  ENROLLMENT NUMBER FIELD
                  ════════════════════════════════════════ */}
              <div>
                <div className="relative">
                  <IdCard className={iconClass} />
                  <input
                    type="text"
                    placeholder="Enrollment number / Employee ID"
                    {...register('enrollmentNumber')}
                    // ^^^ This connects the input to RHF
                    // RHF will automatically track changes and validate with Zod
                    className={`${inputClass} ${
                      errors.enrollmentNumber 
                        ? 'border-red-500 bg-red-50' // Red border if error
                        : ''
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {/* Show error message below field */}
                {errors.enrollmentNumber && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 mt-2 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.enrollmentNumber.message}
                  </div>
                )}
              </div>

              {/* ════════════════════════════════════════
                  PASSWORD FIELD
                  ════════════════════════════════════════ */}
              <div>
                <div className="relative">
                  <Lock className={iconClass} />
                  <input
                    type="password"
                    placeholder="Password"
                    {...register('password')}
                    className={`${inputClass} ${
                      errors.password 
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.password && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 mt-2 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.password.message}
                  </div>
                )}
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end">
                <a href="#" className="text-xs text-gray-400 hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Show root error message if login fails */}
              {errors.root && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errors.root.message}
                </div>
              )}

              {/* ════════════════════════════════════════
                  SUBMIT BUTTON
                  ════════════════════════════════════════ */}
              <button
                type="submit"
                disabled={isSubmitting}
                // handleSubmit validates form before calling handleFormSubmit
                // If validation fails, nothing happens (onSubmit not called)
                // If validation passes, handleFormSubmit is called
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:scale-100 active:scale-[0.98] transition-all duration-200 py-3 rounded-full text-sm font-semibold text-gray-900"
              >
                {isSubmitting ? 'Signing in...' : 'Login'}
              </button>
            </form>

            {/* Footer */}
            <div className="flex justify-between items-center mt-6 text-xs text-gray-400">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="text-gray-900 font-semibold hover:underline">
                  Register here
                </Link>
              </p>
              <a href="#" className="hover:underline">Terms</a>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}