const express = require('express')
const router = express.Router()
const supabase = require('../supabase')
const { requireAuth } = require('../middleware/auth')

// Get all env vars for a project
router.get('/:projectId', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('env_vars')
      .select('id, key, value, created_at')
      .eq('project_id', req.params.projectId)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Add or update an env var
router.post('/:projectId', requireAuth, async (req, res) => {
  const { key, value } = req.body

  if (!key || !value) {
    return res.status(400).json({ error: 'key and value are required' })
  }

  // Validate key format
  if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) {
    return res.status(400).json({
      error: 'Key must be uppercase letters, numbers and underscores only'
    })
  }

  try {
    const { data, error } = await supabase
      .from('env_vars')
      .upsert({
        project_id: req.params.projectId,
        user_id: req.user.id,
        key,
        value,
      }, { onConflict: 'project_id,key' })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete an env var
router.delete('/:projectId/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('env_vars')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)

    if (error) throw error
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router