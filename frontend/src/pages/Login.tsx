const GITHUB_AUTH_URL = `${import.meta.env.VITE_API_URL}/auth/github`

function Login() {
  return (
    <div style={{ background: 'var(--bg-primary)' }} className="min-h-screen text-white flex items-center justify-center px-4 relative overflow-hidden">

      {/* Grid background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #00ff88, transparent)' }}
      />

      <div className="relative z-10 w-full max-w-sm fade-in">

        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="mono text-xs text-green-400 mb-3 tracking-widest">
            $ deploykit --init
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Deploy<span style={{ color: 'var(--accent)' }}>Kit</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-2 mono">
            PaaS dashboard for developers
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
        }} className="rounded-xl p-7">

          {/* Terminal prompt */}
          <div className="mono text-xs mb-6 space-y-1">
            <p style={{ color: 'var(--text-dim)' }}>
              <span style={{ color: 'var(--accent)' }}>▶</span> Authenticate to continue
            </p>
          </div>

          <a
            href={GITHUB_AUTH_URL}
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-active)' }}
            className="flex items-center justify-center gap-3 w-full hover:border-green-400 text-white font-medium py-3 rounded-lg transition-all duration-200 group"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="text-sm">Continue with GitHub</span>
            <span style={{ color: 'var(--accent)' }} className="ml-auto text-xs mono group-hover:translate-x-1 transition-transform">→</span>
          </a>

          <p style={{ color: 'var(--text-dim)' }} className="mono text-xs text-center mt-5">
            scope: repo, user:email
          </p>
        </div>

        <p style={{ color: 'var(--text-dim)' }} className="text-xs text-center mt-6 mono">
          deploykit v1.0.0 · open source
        </p>
      </div>
    </div>
  )
}

export default Login