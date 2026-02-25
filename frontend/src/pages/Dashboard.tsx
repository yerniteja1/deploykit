import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800 bg-gray-900">
        <span className="text-lg font-bold">
          Deploy<span className="text-indigo-400">Kit</span>
        </span>
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar_url}
            alt={user?.username}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm text-gray-300">{user?.username}</span>
          <button
            onClick={logout}
            className="text-sm border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name} 👋</h1>
        <p className="text-gray-400">Your projects will appear here.</p>
      </main>
    </div>
  )
}

export default Dashboard