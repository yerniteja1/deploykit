import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'
import EnvVarsPanel from '../components/EnvVarsPanel'

interface Project {
  id: string
  name: string
  repo_name: string
  repo_url: string
  repo_full_name: string
  branch: string
  status: string
  created_at: string
}

interface Deployment {
  id: string
  status: string
  logs: string
  created_at: string
  finished_at: string
}

const statusColors: Record<string, string> = {
  idle: 'bg-gray-700 text-gray-300',
  building: 'bg-yellow-900 text-yellow-300',
  deployed: 'bg-green-900 text-green-300',
  failed: 'bg-red-900 text-red-300',
}

function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  const [deploying, setDeploying] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchProject()
    fetchDeployments()
  }, [id])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  async function fetchProject() {
    try {
      const res = await api.get(`/projects/${id}`)
      setProject(res.data)
    } catch {
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  async function fetchDeployments() {
    try {
      const res = await api.get(`/deployments/${id}`)
      setDeployments(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDeploy() {
    if (!project || deploying) return
    setDeploying(true)
    setLogs([])
    setSelectedDeployment(null)

    try {
      const eventSource = new EventSource(
        `${import.meta.env.VITE_API_URL}/deployments/${id}/deploy`,
        { withCredentials: true }
      )

      eventSource.onmessage = (e) => {
        const data = JSON.parse(e.data)

        if (data.log) {
          setLogs(prev => [...prev, data.log])
        }

        if (data.status) {
          setProject(prev => prev ? { ...prev, status: data.status } : prev)
          eventSource.close()
          setDeploying(false)
          fetchDeployments()
        }
      }

      eventSource.onerror = () => {
        eventSource.close()
        setDeploying(false)
        fetchDeployments()
      }

    } catch (err) {
      console.error(err)
      setDeploying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-white text-sm mb-3 flex items-center gap-1 transition"
            >
              ← Back to projects
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{project?.name}</h1>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project?.status || 'idle']}`}>
                {project?.status}
              </span>
            </div>
            <a
              href={project?.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-indigo-400 transition mt-1 block"
            >
              {project?.repo_full_name} ({project?.branch})
            </a>
          </div>

          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            {deploying ? (
              <>
                <span className="animate-spin">⚙️</span> Deploying...
              </>
            ) : (
              <>🚀 Deploy</>
            )}
          </button>
        </div>

        {/* Live logs */}
        {(deploying || logs.length > 0) && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
            <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
              {deploying ? '⚡ Live Deployment Logs' : '📋 Last Deployment Logs'}
            </h2>
            <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs text-green-400 h-64 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="mb-1">{log}</div>
              ))}
              {deploying && (
                <div className="animate-pulse text-gray-500">▋</div>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {/* Deployment history */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Deployment History</h2>

          {deployments.length === 0 ? (
            <div className="text-center text-gray-500 py-12 border border-dashed border-gray-800 rounded-xl">
              No deployments yet. Click Deploy to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {deployments.map(dep => (
                <div
                  key={dep.id}
                  onClick={() => setSelectedDeployment(
                    selectedDeployment?.id === dep.id ? null : dep
                  )}
                  className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[dep.status]}`}>
                        {dep.status}
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date(dep.created_at).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-gray-600 text-sm">
                      {selectedDeployment?.id === dep.id ? '▲' : '▼'}
                    </span>
                  </div>

                  {selectedDeployment?.id === dep.id && dep.logs && (
                    <div className="mt-4 bg-gray-950 rounded-lg p-4 font-mono text-xs text-green-400 max-h-48 overflow-y-auto">
                      {dep.logs.split('\n').map((line, i) => (
                        <div key={i} className="mb-1">{line}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
          {/* Env vars */}
        <div className="mt-8">
          <EnvVarsPanel projectId={id!} />
        </div>

      </main>
    </div>
  )
}

export default ProjectDetail