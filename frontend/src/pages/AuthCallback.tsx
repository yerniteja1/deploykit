import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      localStorage.setItem('token', token)
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/login?error=auth_failed', { replace: true })
    }
  }, [])

  return (
    <div style={{ background: 'var(--bg-primary)' }} className="min-h-screen flex items-center justify-center">
      <p className="mono text-sm" style={{ color: 'var(--text-secondary)' }}>
        Authenticating...
      </p>
    </div>
  )
}

export default AuthCallback