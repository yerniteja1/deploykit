import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import ProjectCard from '../components/ProjectCard'
import RepoPickerModal from '../components/RepoPickerModal'
import api from '../lib/api'

interface Project {
  id: string
  name: string
  repo_name: string
  repo_url: string
  branch: string
  status: string
  created_at: string
}

function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api.get('/projects')
      .then(res => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function handleCreated(project: Project) {
    setProjects(prev => [project, ...prev])
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/projects/${id}`)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }} className="text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="mono text-xs mb-2" style={{ color: 'var(--accent)' }}>
              ▶ projects
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">All Projects</h1>
            <p className="mono text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {loading ? 'fetching...' : `${projects.length} total`}
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
            }}
            className="mono text-xs px-4 py-2 rounded-lg hover:bg-green-400 hover:text-black transition-all duration-200 font-medium"
          >
            + new project
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                className="rounded-xl p-5 animate-pulse h-32"
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && projects.length === 0 && (
          <div
            style={{ border: '1px dashed var(--border-active)' }}
            className="rounded-xl py-24 text-center"
          >
            <div className="mono text-4xl mb-4" style={{ color: 'var(--text-dim)' }}>⬡</div>
            <p className="mono text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
              no projects found
            </p>
            <p className="mono text-xs mb-6" style={{ color: 'var(--text-dim)' }}>
              connect a github repo to get started
            </p>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: 'var(--accent-dim)',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
              }}
              className="mono text-xs px-4 py-2 rounded-lg hover:bg-green-400 hover:text-black transition-all duration-200"
            >
              + connect repo
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <RepoPickerModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}

export default Dashboard