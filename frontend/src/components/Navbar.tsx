import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()

  return (
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
  )
}

export default Navbar