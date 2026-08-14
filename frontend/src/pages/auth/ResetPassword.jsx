import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { auth } from '../../services/api'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Lock, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react'
import Button from '../../components/common/Button'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters long'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isSuccess, setIsSuccess] = useState(false)

  const uid = searchParams.get('uid')
  const token = searchParams.get('token')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    if (!uid || !token) {
      toast.error('Missing required parameters from link.')
      return
    }

    try {
      await auth.resetPassword(uid, token, data.password, data.confirmPassword)
      setIsSuccess(true)
      toast.success('Password reset successfully!')
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to reset password. The link may have expired.'
      toast.error(errMsg)
    }
  }

  if (!uid || !token) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-[32px] p-8 text-center shadow-2xl">
          <div className="flex justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-rose-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Request</h2>
          <p className="text-sm text-gray-400 mb-8">
            This password reset link is invalid or incomplete.
          </p>
          <Link
            to="/login"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-full text-sm transition-all"
          >
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-[32px] p-8 shadow-2xl relative text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
            <KeyRound className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Reset Password</h2>
        <p className="text-sm text-gray-400 text-center mb-8">
          Enter your new password below.
        </p>

        {isSuccess ? (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-700 text-sm">
              Your password has been reset successfully! Redirecting you to the login page...
            </div>
            <Link
              to="/login"
              className="block w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold py-3 rounded-full text-sm transition-all"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="New Password"
                  {...register('password')}
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-3.5 pl-12 pr-6 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:bg-white transition-all duration-200"
                  disabled={isSubmitting}
                />
              </div>
              {errors.password && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 mt-2 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errors.password.message}
                </div>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  {...register('confirmPassword')}
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-3.5 pl-12 pr-6 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:bg-white transition-all duration-200"
                  disabled={isSubmitting}
                />
              </div>
              {errors.confirmPassword && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 mt-2 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              loadingText="Resetting password..."
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold py-3 rounded-full text-sm transition-all duration-200"
            >
              Reset Password
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
