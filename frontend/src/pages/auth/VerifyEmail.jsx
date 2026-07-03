import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function VerifyEmail() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div>
      <h1>Verify Your Email</h1>
      <p>Your email {currentUser?.email} is not verified yet.</p>
      <button onClick={() => navigate('/profile')}>
        Update email
      </button>
      <button onClick={() => { logout(); navigate('/login') }}>
        Log out
      </button>
    </div>
  )
}