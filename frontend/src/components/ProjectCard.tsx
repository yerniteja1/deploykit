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

const statusColors: Record<string, string> = {
  idle: 'bg-gray-700 text-gray-300',
  building: 'bg-yellow-900 text-yellow-300',
  deployed: 'bg-green-900 text-green-300',
  failed: 'bg-red-900 text-red-300',
}

function ProjectCard({ project, onDelete }: { project: Project, onDelete: (id: string) => void }) {
  const navigate = useNavigate()

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`Delete "${project.name}"?`)) return
    onDelete(project.id)
  }

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="bg-gray-900 border border-gray-800 hover:border-indigo-600 rounded-xl p-5 cursor-pointer transition group relative"
    >
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition text-lg"
      >
        🗑
      </button>

      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl">📦</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white group-hover:text-indigo-400 transition truncate">
            {project.name}
          </h3>
          <a
            href={project.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-xs text-gray-500 hover:text-indigo-400 transition truncate block"
          >
            {project.repo_name}
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-gray-500">
          Branch: <span className="text-gray-300">{project.branch}</span>
        </span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status] || statusColors.idle}`}>
          {project.status}
        </span>
      </div>
    </div>
  )
}

export default ProjectCard