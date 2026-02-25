import { useState, useEffect } from 'react'
import api from '../lib/api'

interface Repo {
  id: number
  name: string
  full_name: string
  url: string
  description: string
  language: string
  default_branch: string
  private: boolean
}

interface Props {
  onClose: () => void
  onCreated: (project: any) => void
}

function RepoPickerModal({ onClose, onCreated }: Props) {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Repo | null>(null)
  const [projectName, setProjectName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/projects/github/repos')
      .then(res => setRepos(res.data))
      .catch(() => setError('Failed to load repos'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = repos.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleSelect(repo: Repo) {
    setSelected(repo)
    setProjectName(repo.name)
  }

  async function handleCreate() {
    if (!selected || !projectName) return
    setCreating(true)
    setError('')
    try {
      const res = await api.post('/projects', {
        name: projectName,
        repo_name: selected.name,
        repo_url: selected.url,
        repo_full_name: selected.full_name,
        branch: selected.default_branch,
      })
      onCreated(res.data)
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-lg">Connect a Repository</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>

        {!selected ? (
          <div className="p-6">
            <input
              type="text"
              placeholder="Search repos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition mb-4 text-sm"
            />

            {loading && <p className="text-gray-500 text-sm text-center py-8">Loading repos...</p>}
            {error && <p className="text-red-400 text-sm text-center py-4">{error}</p>}

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filtered.map(repo => (
                <div
                  key={repo.id}
                  onClick={() => handleSelect(repo)}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-800 hover:border-indigo-500 cursor-pointer transition"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{repo.name}</p>
                    {repo.description && (
                      <p className="text-xs text-gray-500 truncate max-w-xs">{repo.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {repo.language && (
                      <span className="text-xs text-gray-500">{repo.language}</span>
                    )}
                    {repo.private && (
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">Private</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-400">Selected repo</p>
              <p className="font-medium text-white">{selected.full_name}</p>
              <p className="text-xs text-gray-500">Branch: {selected.default_branch}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition text-sm"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 border border-gray-700 hover:border-gray-500 text-gray-300 py-2.5 rounded-lg text-sm transition"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!projectName || creating}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition"
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RepoPickerModal