import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-500 mb-4">404</h1>
        <p className="text-gray-400 mb-6">Page not found.</p>
        <Link to="/" className="text-indigo-400 hover:underline">Go home</Link>
      </div>
    </div>
  )
}

export default NotFound