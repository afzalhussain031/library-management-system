import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { auth } from '../../services/api'
import { toast } from 'react-hot-toast'
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')

  const uid = searchParams.get('uid')
  const token = searchParams.get('token')

  useEffect(() => {
    const performVerification = async () => {
      if (!uid || !token) {
        setStatus('error')
        setMessage('Invalid verification link. Missing parameters.')
        return
      }

      try {
        const response = await auth.verifyEmail(uid, token)
        setStatus('success')
        setMessage(response.detail || 'Email verified successfully! Redirecting to login...')
        toast.success('Email verified successfully!')
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } catch (err) {
        setStatus('error')
        const errMsg = err.response?.data?.detail || 'Invalid or expired verification token.'
        setMessage(errMsg)
        toast.error(errMsg)
      }
    }

    performVerification()
  }, [uid, token, navigate])

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-[32px] p-8 shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
            <Mail className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verification</h2>
        <p className="text-sm text-gray-400 mb-8">LibraryHub Authentication</p>

        {status === 'verifying' && (
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
            </div>
            <p className="text-gray-700 font-medium">Verifying your email address...</p>
            <p className="text-gray-400 text-xs">Please wait while we validate your credentials.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce" />
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-700 text-sm">
              {message}
            </div>
            <Link
              to="/login"
              className="block w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold py-3 rounded-full text-sm transition-all duration-200"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <XCircle className="w-12 h-12 text-rose-500 animate-pulse" />
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-700 text-sm">
              {message}
            </div>
            <p className="text-gray-400 text-xs px-2">
              If the link has expired, you can request a new verification link by attempting to log in again.
            </p>
            <Link
              to="/login"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-full text-sm transition-all duration-200"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
