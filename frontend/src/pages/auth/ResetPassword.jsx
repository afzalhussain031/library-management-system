import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema } from '../../schemas/formSchemas'
import { auth } from '../../services/api'
import { toast } from 'react-hot-toast'
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import loginImage from '../../assets/signup-image.jpg'
import Button from '../../components/common/Button'

// ====== PASSWORD STRENGTH CALCULATOR ======
function getPasswordStrength(password) {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return Math.min(score, 4)
}

const strengthConfig = {
  0: { label: '', color: '' },
  1: { label: 'Weak', color: 'bg-red-500' },
  2: { label: 'Fair', color: 'bg-orange-400' },
  3: { label: 'Good', color: 'bg-yellow-400' },
  4: { label: 'Strong', color: 'bg-green-500' },
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const uid = searchParams.get('uid')
  const token = searchParams.get('token')

  const [isVerifying, setIsVerifying] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const watchedPassword = watch('password', '')
  const strengthScore = getPasswordStrength(watchedPassword)

  // Verify token on initial render
  useEffect(() => {
    let isMounted = true

    if (!uid || !token) {
      setIsVerifying(false)
      setIsTokenValid(false)
      setVerifyError('The reset link is incomplete or missing necessary tokens.')
      return
    }

    auth
      .verifyResetToken(uid, token)
      .then((res) => {
        if (!isMounted) return
        if (res.data?.valid) {
          setIsTokenValid(true)
        } else {
          setIsTokenValid(false)
          setVerifyError(res.data?.detail || 'This reset link is invalid or expired.')
        }
      })
      .catch((err) => {
        if (!isMounted) return
        setIsTokenValid(false)
        setVerifyError(
          err.response?.data?.detail || 'This reset link has expired or has already been used.'
        )
      })
      .finally(() => {
        if (isMounted) setIsVerifying(false)
      })

    return () => {
      isMounted = false
    }
  }, [uid, token])

  const onSubmit = async (data) => {
    try {
      await auth.resetPassword({
        user_id: uid,
        token: token,
        new_password: data.password,
        new_password2: data.password2,
      })

      setIsSuccess(true)
      toast.success('Password updated successfully!')

      // Automatically redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      const serverMsg =
        err.response?.data?.detail ||
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.new_password2?.[0] ||
        err.message ||
        'Failed to reset password. Please try again.'

      setError('root', { message: serverMsg })
      toast.error(serverMsg)
    }
  }

  const inputClass =
    'w-full rounded-full border border-gray-200 bg-gray-50 px-5 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40 placeholder:text-gray-400 text-gray-800 disabled:opacity-60'
  const iconClass =
    'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none'

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[1000px] bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[580px]">
        {/* ══════════════════════════════════════════════════════════
            LEFT PANEL: Visual Branding
            ══════════════════════════════════════════════════════════ */}
        <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-10 overflow-hidden">
          <img
            src={loginImage}
            alt="Library"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

          {/* Top Logo / Title */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <span className="text-white font-bold text-lg leading-tight block">
                LibraryMS
              </span>
              <span className="text-white/60 text-xs">Knowledge & Circulation</span>
            </div>
          </div>

          {/* Bottom Card Context */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-white">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-base">Protect Your Account</h3>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              Choose a strong, unique password of at least 8 characters. Do not reuse passwords from other services.
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RIGHT PANEL: Content / Form
            ══════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-between">
          <div>
            {/* 1. Loading State */}
            {isVerifying && (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800">Verifying link...</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Please wait while we validate your security token.
                </p>
              </div>
            )}

            {/* 2. Invalid Token State */}
            {!isVerifying && !isTokenValid && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Link Expired or Invalid
                </h2>
                <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto leading-relaxed">
                  {verifyError ||
                    'This password reset link is invalid or has expired. Password reset links are single-use and expire in 1 hour.'}
                </p>
                <div className="space-y-3">
                  <Link
                    to="/forgot-password"
                    className="block w-full bg-yellow-400 hover:bg-yellow-300 py-3 rounded-full text-sm font-semibold text-gray-900 transition shadow"
                  >
                    Request a New Reset Link
                  </Link>
                  <Link
                    to="/login"
                    className="block w-full py-2.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}

            {/* 3. Successful Reset State */}
            {!isVerifying && isTokenValid && isSuccess && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Password Updated!
                </h2>
                <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto leading-relaxed">
                  Your password has been reset successfully. You will be redirected to the login page in a moment.
                </p>
                <Button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 py-3 rounded-full text-sm font-semibold text-gray-900 transition flex items-center justify-center gap-2"
                >
                  Log In Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* 4. Active Reset Password Form */}
            {!isVerifying && isTokenValid && !isSuccess && (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Set New Password
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter your new password below to regain access to your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className={iconClass} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        placeholder="At least 8 characters"
                        className={`${inputClass} ${
                          errors.password ? 'border-red-500 bg-red-50' : ''
                        }`}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {watchedPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1 h-1.5">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`flex-1 rounded-full transition-all duration-300 ${
                                step <= strengthScore
                                  ? strengthConfig[strengthScore].color
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        {strengthScore > 0 && (
                          <p className="text-xs text-gray-500 text-right">
                            Strength: <span className="font-semibold">{strengthConfig[strengthScore].label}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {errors.password && (
                      <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-2 mt-2 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {errors.password.message}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className={iconClass} />
                      <input
                        type={showPassword2 ? 'text' : 'password'}
                        {...register('password2')}
                        placeholder="Re-enter your new password"
                        className={`${inputClass} ${
                          errors.password2 ? 'border-red-500 bg-red-50' : ''
                        }`}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword2(!showPassword2)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showPassword2 ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password2 && (
                      <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-2 mt-2 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {errors.password2.message}
                      </div>
                    )}
                  </div>

                  {/* Root Error */}
                  {errors.root && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {errors.root.message}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    loadingText="Updating password..."
                    className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-200 disabled:text-gray-400 py-3 rounded-full text-sm font-semibold text-gray-900 transition shadow hover:shadow-md active:scale-[0.98] mt-2"
                  >
                    Reset Password
                  </Button>
                </form>
              </>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-6 border-t border-gray-100 text-center">
            <Link
              to="/login"
              className="text-xs text-gray-500 hover:text-gray-900 transition"
            >
              Remembered your password? <span className="font-semibold underline">Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
