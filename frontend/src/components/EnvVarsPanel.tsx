import { useState, useEffect } from 'react'
import api from '../lib/api'

interface EnvVar {
  id: string
  key: string
  value: string
  created_at: string
}

interface Props {
  projectId: string
}

function EnvVarsPanel({ projectId }: Props) {
  const [envVars, setEnvVars] = useState<EnvVar[]>([])
  const [loading, setLoading] = useState(true)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchEnvVars()
  }, [projectId])

  async function fetchEnvVars() {
    try {
      const res = await api.get(`/env-vars/${projectId}`)
      setEnvVars(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    if (!newKey || !newValue) return
    setError('')
    setAdding(true)
    try {
      const res = await api.post(`/env-vars/${projectId}`, {
        key: newKey.toUpperCase().replace(/\s/g, '_'),
        value: newValue,
      })
      setEnvVars(prev => {
        const exists = prev.findIndex(e => e.key === res.data.key)
        if (exists >= 0) {
          const updated = [...prev]
          updated[exists] = res.data
          return updated
        }
        return [...prev, res.data]
      })
      setNewKey('')
      setNewValue('')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add variable')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/env-vars/${projectId}/${id}`)
      setEnvVars(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  function toggleReveal(id: string) {
    setRevealed(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function maskValue(value: string) {
    return '•'.repeat(Math.min(value.length, 20))
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-5">Environment Variables</h2>

      {/* Add new var */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          placeholder="KEY_NAME"
          value={newKey}
          onChange={e => setNewKey(e.target.value.toUpperCase().replace(/\s/g, '_'))}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm font-mono"
        />
        <input
          type="text"
          placeholder="value"
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm font-mono"
        />
        <button
          onClick={handleAdd}
          disabled={!newKey || !newValue || adding}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {adding ? '...' : 'Add'}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-xs mb-4">{error}</p>
      )}

      {/* Env vars list */}
      {loading && (
        <p className="text-gray-500 text-sm text-center py-6">Loading...</p>
      )}

      {!loading && envVars.length === 0 && (
        <div className="text-center text-gray-600 text-sm py-8 border border-dashed border-gray-800 rounded-lg">
          No environment variables yet
        </div>
      )}

      {!loading && envVars.length > 0 && (
        <div className="space-y-2">
          {envVars.map(env => (
            <div
              key={env.id}
              className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3 group"
            >
              <span className="text-sm font-mono text-indigo-300 w-40 truncate shrink-0">
                {env.key}
              </span>
              <span className="text-sm font-mono text-gray-400 flex-1 truncate">
                {revealed[env.id] ? env.value : maskValue(env.value)}
              </span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => toggleReveal(env.id)}
                  className="text-gray-500 hover:text-white text-xs transition"
                  title={revealed[env.id] ? 'Hide' : 'Reveal'}
                >
                  {revealed[env.id] ? '🙈' : '👁'}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(env.value)
                  }}
                  className="text-gray-500 hover:text-white text-xs transition"
                  title="Copy value"
                >
                  📋
                </button>
                <button
                  onClick={() => handleDelete(env.id)}
                  className="text-gray-500 hover:text-red-400 text-xs transition"
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-600 mt-4">
        ⚠️ Variables are available during the next deployment
      </p>
    </div>
  )
}

export default EnvVarsPanel