const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config')

function requireAuth(req, res, next) {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = { requireAuth }