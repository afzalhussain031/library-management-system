import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema } from '../../schemas/formSchemas'
import { auth } from '../../services/api'
import { toast } from 'react-hot-toast'
import { Mail, AlertCircle, ArrowLeft, CheckCircle2, BookOpen, KeyRound } from 'lucide-react'
import loginImage from '../../assets/signup-image.jpg'
import Button from '../../components/common/Button'

export default function ForgotPassword() {
  const [submittedEmail, setSubmittedEmail] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const onSubmit = async (data) => {
    try {
      await auth.forgotPassword(data.email)
      setSubmittedEmail(data.email)
      toast.success('Password reset link sent!')
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Unable to send reset email. Please try again later.'
      setError('root', { message: errorMessage })
      toast.error(errorMessage)
    }
  }

  const inputClass =
    'w-full rounded-full border border-gray-200 bg-gray-50 px-5 py-3 pl-10 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40 placeholder:text-gray-400 text-gray-800 disabled:opacity-60'
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
              <KeyRound className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-base">Account Security</h3>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              Reset links are encrypted and time-limited to protect your account and library circulation privileges.
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RIGHT PANEL: Interactive Card
            ══════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-between">
          {/* Header */}
          <div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>

            {!submittedEmail ? (
              <>
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-yellow-700 flex items-center justify-center mb-4 shadow-sm">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Forgot Password?
                  </h1>
                  <p className="text-sm text-gray-500 mt-2">
                    Enter the email address registered with your account. We will send you a secure link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5 ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className={iconClass} />
                      <input
                        type="email"
                        {...register('email')}
                        placeholder="e.g. yourname@example.com"
                        className={`${inputClass} ${
                          errors.email ? 'border-red-500 bg-red-50' : ''
                        }`}
                        disabled={isSubmitting}
                        autoFocus
                      />
                    </div>
                    {errors.email && (
                      <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-2.5 mt-2 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {errors.email.message}
                      </div>
                    )}
                  </div>

                  {errors.root && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {errors.root.message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    loadingText="Sending link..."
                    className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-200 disabled:text-gray-400 py-3 rounded-full text-sm font-semibold text-gray-900 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                  >
                    Send Reset Link
                  </Button>
                </form>
              </>
            ) : (
              /* Success / Email Sent Card */
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                <p className="text-sm text-gray-600 mb-4 max-w-sm mx-auto leading-relaxed">
                  If an account exists for <span className="font-semibold text-gray-900">{submittedEmail}</span>, we have sent instructions to reset your password.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 text-left mb-6">
                  <p className="font-semibold mb-1">Didn't see the email?</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-700">
                    <li>Check your spam or junk folder</li>
                    <li>In local development, check the backend console terminal</li>
                    <li>Wait a few minutes or click resend below</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setSubmittedEmail(null)}
                    className="w-full py-2.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Resend or enter another email
                  </button>

                  <Link
                    to="/login"
                    className="block w-full bg-yellow-400 hover:bg-yellow-300 py-3 rounded-full text-sm font-semibold text-gray-900 text-center transition"
                  >
                    Return to Login
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Need assistance? Contact your library administrator or staff desk.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
