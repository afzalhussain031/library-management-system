import { useState } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../../services/api'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, AlertCircle, ArrowLeft, Send } from 'lucide-react'
import Button from '../../components/common/Button'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

export default function ForgotPassword() {
  const [isSuccess, setIsSuccess] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      await auth.forgotPassword(data.email)
      setIsSuccess(true)
      toast.success('Password reset link sent to your email!')
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to send password reset email.'
      toast.error(errMsg)
    }
  }

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-[32px] p-8 shadow-2xl relative">
        <div className="mb-8">
          <Link to="/login" className="inline-flex items-center text-xs text-gray-400 hover:text-gray-900 gap-2 transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
            <Mail className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Forgot Password?</h2>
        <p className="text-sm text-gray-400 text-center mb-8">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {isSuccess ? (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-700 text-sm text-center">
              We have sent a password reset link to your email. Please check your inbox and follow the instructions.
            </div>
            <Link
              to="/login"
              className="block w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold py-3 rounded-full text-center text-sm transition-all duration-200"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Your Email Address"
                  {...register('email')}
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-3.5 pl-12 pr-6 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:bg-white transition-all duration-200"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 mt-2 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errors.email.message}
                </div>
              )}
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              loadingText="Sending link..."
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold py-3 rounded-full text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Send Reset Link
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
