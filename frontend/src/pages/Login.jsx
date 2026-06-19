import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' // Kept your original context path
import { IdCard, Lock, AlertCircle, BookOpen, GraduationCap, Briefcase, ShieldCheck } from 'lucide-react'
// import loginImage from "../../assets/signup-image.jpg"

export default function Login() {
  const [enrollmentNumber, setEnrollmentNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false) // Added from current code

  const { login } = useAuth()
  const navigate = useNavigate()

  // 1. Made this function async to handle network requests
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!enrollmentNumber || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true) // Turn on loading spinner state

    try {
      // 2. Await the actual server response. Your context expects (username, password)
      const user = await login(enrollmentNumber, password)
      
      // 3. Smart routing based on the role returned by your backend database
      if (user?.role === 'superadmin') {
        navigate('/superadmin/dashboard')
      } else if (user?.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      // 4. Fallback error message if backend rejects credentials
      setError('Invalid enrollment number or password')
    } finally {
      setLoading(false) // Turn off loading state regardless of win or lose
    }
  }

  const inputClass =
    "w-full rounded-full border border-gray-200 bg-gray-50 px-5 py-3 pl-10 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40 placeholder:text-gray-400 text-gray-800 disabled:opacity-60"

  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[1100px] bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[600px]">

        {/* ── LEFT: Image panel ── */}
        <div className="relative w-full lg:w-[52%] overflow-hidden min-h-[300px]">
          <img
            // src={loginImage}
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

        {/* ── RIGHT: Login form ── */}
        <div className="w-full lg:w-[48%] bg-white flex items-center justify-center px-8 py-12 lg:px-14">
          <div className="w-full max-w-sm">

            <h2 className="text-2xl font-semibold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-400 mt-1 mb-8">
              Sign in to your LibraryHub account
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 mb-5 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Enrollment */}
              <div className="relative">
                <IdCard className={iconClass} />
                <input
                  type="text"
                  name="enrollmentNumber"
                  value={enrollmentNumber}
                  onChange={(e) => setEnrollmentNumber(e.target.value)}
                  placeholder="Enrollment number / Employee ID"
                  required
                  className={inputClass}
                  disabled={loading} // Disabled inputs while loading
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className={iconClass} />
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className={inputClass}
                  disabled={loading} // Disabled inputs while loading
                />
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <a href="#" className="text-xs text-gray-400 hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Submit with loading state context feedback */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:scale-100 active:scale-[0.98] transition-all duration-200 py-3 rounded-full text-sm font-semibold text-gray-900"
              >
                {loading ? 'Signing in...' : 'Login'}
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