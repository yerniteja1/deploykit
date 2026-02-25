const express = require('express')
const axios = require('axios')
const router = express.Router()
const supabase = require('../supabase')
const { requireAuth } = require('../middleware/auth')

// Get all projects for current user
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get user's GitHub repos
router.get('/github/repos', requireAuth, async (req, res) => {
  try {
    // Get user's access token from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('access_token')
      .eq('id', req.user.id)
      .single()

    if (error) throw error

    const reposRes = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `Bearer ${user.access_token}` },
      params: {
        sort: 'updated',
        per_page: 30,
        type: 'owner'
      }
    })

    const repos = reposRes.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      url: repo.html_url,
      description: repo.description,
      language: repo.language,
      default_branch: repo.default_branch,
      updated_at: repo.updated_at,
      private: repo.private,
    }))

    res.json(repos)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Create a new project
router.post('/', requireAuth, async (req, res) => {
  const { name, repo_name, repo_url, repo_full_name, branch } = req.body

  if (!name || !repo_full_name) {
    return res.status(400).json({ error: 'name and repo_full_name are required' })
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: req.user.id,
        name,
        repo_name,
        repo_url,
        repo_full_name,
        branch: branch || 'main',
        status: 'idle',
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete a project
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)

    if (error) throw error
    res.json({ message: 'Project deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get single project
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Project not found' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
module.exports = router