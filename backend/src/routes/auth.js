const express = require('express')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const router = express.Router()
const supabase = require('../supabase')
const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  JWT_SECRET,
  CLIENT_URL
} = require('../config')

// Step 1: Redirect to GitHub
router.get('/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo,user`
  res.redirect(githubAuthUrl)
})

// Step 2: GitHub redirects back with a code
router.get('/github/callback', async (req, res) => {
  const { code } = req.query

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } }
    )

    const accessToken = tokenRes.data.access_token

    // Get user info from GitHub
    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    const githubUser = userRes.data

    // Upsert user in Supabase
    const { data, error } = await supabase
      .from('users')
      .upsert({
        github_id: String(githubUser.id),
        username: githubUser.login,
        name: githubUser.name || githubUser.login,
        avatar_url: githubUser.avatar_url,
        email: githubUser.email,
        access_token: accessToken,
      }, { onConflict: 'github_id' })
      .select()
      .single()

    if (error) throw error

    // Create JWT
    const token = jwt.sign(
      {
        id: data.id,
        github_id: data.github_id,
        username: data.username,
        name: data.name,
        avatar_url: data.avatar_url,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Set cookie and redirect to frontend
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    })

    res.redirect(`${CLIENT_URL}/dashboard`)

  } catch (err) {
    console.error('GitHub OAuth error:', err.message)
    res.redirect(`${CLIENT_URL}/login?error=auth_failed`)
  }
})

// Get current user
router.get('/me', (req, res) => {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  try {
    const user = jwt.verify(token, JWT_SECRET)
    res.json({ user })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out' })
})

module.exports = router