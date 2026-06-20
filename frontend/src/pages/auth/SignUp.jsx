import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema } from '../../schemas/formSchemas'
import {
  User, Users, Baby, IdCard, Phone, Mail,
  Lock, KeyRound, AlertCircle, Bell, CheckCircle
} from 'lucide-react'
import signupImage from "../../assets/signup-image.jpg"

export default function SignUp() {
  const navigate = useNavigate()
  const [showSuccess, setShowSuccess] = useState(false)

  // ====== REACT HOOK FORM SETUP ======
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch // Watch specific fields (like confirmPassword)
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur' // Validate when user leaves field
  })

  // ====== FORM SUBMISSION ======
  const onSubmit = async (data) => {
    try {
      // data is already validated by Zod
      console.log('Registration data:', data)
      
      // TODO: Send to backend API
      // const response = await registerUser(data)
      
      setShowSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      console.error('Registration error:', err)
    }
  }

  // ====== HELPER: Render input with error ======
  // This reduces code duplication (DRY principle)
  const renderInput = (fieldName, label, type = 'text', icon = null) => (
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
          }`}
          disabled={isSubmitting}
        />
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
            LEFT PANEL: Image
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

            {/* ============ FORM STARTS HERE ============ */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              
              {/* Full Name */}
              {renderInput('fullName', 'Full Name', 'text', 
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              )}

              <div className="flex gap-3">
                {/* Father's Name */}
                <div className="flex-1">
                  {renderInput('fatherName', "Father's Name", 'text',
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  )}
                </div>

                {/* Mother's Name */}
                <div className="flex-1">
                  {renderInput('motherName', "Mother's Name", 'text',
                    <Baby className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Enrollment Number */}
              {renderInput('enrollmentNumber', 'Enrollment Number', 'text',
                <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              )}

              <div className="flex gap-3">
                {/* Phone Number */}
                <div className="flex-1">
                  {renderInput('phoneNumber', 'Phone Number', 'tel',
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  )}
                </div>

                {/* Email */}
                <div className="flex-1">
                  {renderInput('email', 'Email', 'email',
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                {/* Password */}
                <div className="flex-1">
                  {renderInput('password', 'Password', 'password',
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex-1">
                  {renderInput('confirmPassword', 'Confirm Password', 'password',
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  )}
                </div>
              </div>

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