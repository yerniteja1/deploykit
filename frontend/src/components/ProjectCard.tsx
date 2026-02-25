import { useNavigate } from 'react-router-dom'

interface Project {
  id: string
  name: string
  repo_name: string
  repo_url: string
  branch: string
  status: string
  created_at: string
}

const statusConfig: Record<string, { color: string, dot: string, label: string }> = {
  idle:     { color: '#888888', dot: '#444444', label: 'idle' },
  building: { color: '#f59e0b', dot: '#f59e0b', label: 'building' },
  deployed: { color: '#00ff88', dot: '#00ff88', label: 'deployed' },
  failed:   { color: '#ff4444', dot: '#ff4444', label: 'failed' },
}

function ProjectCard({ project, onDelete }: { project: Project, onDelete: (id: string) => void }) {
  const navigate = useNavigate()
  const status = statusConfig[project.status] || statusConfig.idle

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`Delete "${project.name}"?`)) return
    onDelete(project.id)
  }

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
      }}
      className="rounded-xl p-5 cursor-pointer group transition-all duration-200 hover:border-green-400 relative"
    >
      {/* Delete */}
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 mono text-xs opacity-0 group-hover:opacity-100 transition-all duration-200"
        style={{ color: 'var(--text-dim)' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ff4444')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
      >
        rm
      </button>

      {/* Status dot */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`w-2 h-2 rounded-full ${project.status === 'building' ? 'pulse-active' : ''}`}
          style={{ background: status.dot }}
        />
        <span className="mono text-xs" style={{ color: status.color }}>
          {status.label}
        </span>
      </div>

      {/* Name */}
      <h3 className="font-semibold text-sm mb-1 truncate pr-6">
        {project.name}
      </h3>

      {/* Repo */}
      <p className="mono text-xs truncate mb-4" style={{ color: 'var(--text-secondary)' }}>
        {project.repo_name}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="mono text-xs px-2 py-0.5 rounded"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-dim)', border: '1px solid var(--border)' }}>
          {project.branch}
        </span>
        <span className="mono text-xs" style={{ color: 'var(--text-dim)' }}>
          {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}

export default ProjectCard