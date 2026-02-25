import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
    }} className="flex items-center justify-between px-6 py-3">

      {/* Logo */}
      <div
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-3 cursor-pointer"
      >
        <div style={{ color: 'var(--accent)' }} className="mono text-lg font-bold">
          ⬡ DeployKit
        </div>
        <div style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)'
        }} className="mono text-xs px-2 py-0.5 rounded">
          v1.0
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mono text-xs" style={{ color: 'var(--text-dim)' }}>
        {location.pathname === '/dashboard' ? '~/projects' : '~/projects/detail'}
      </div>

      {/* User */}
      <div className="flex items-center gap-3">
        <img
          src={user?.avatar_url}
          alt={user?.username}
          className="w-7 h-7 rounded-full"
          style={{ border: '1px solid var(--border-active)' }}
        />
        <span className="mono text-xs" style={{ color: 'var(--text-secondary)' }}>
          {user?.username}
        </span>
        <button
          onClick={logout}
          className="mono text-xs px-3 py-1.5 rounded transition-all duration-200"
          style={{
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={e => {
            (e.target as HTMLElement).style.borderColor = '#ff4444'
            ;(e.target as HTMLElement).style.color = '#ff4444'
          }}
          onMouseLeave={e => {
            (e.target as HTMLElement).style.borderColor = 'var(--border)'
            ;(e.target as HTMLElement).style.color = 'var(--text-secondary)'
          }}
        >
          logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar