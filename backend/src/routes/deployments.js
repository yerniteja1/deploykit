const express = require('express')
const router = express.Router()
const supabase = require('../supabase')
const { requireAuth } = require('../middleware/auth')

// Get all deployments for a project
router.get('/:projectId', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('deployments')
      .select('*')
      .eq('project_id', req.params.projectId)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Trigger a new deployment with SSE real-time logs
router.get('/:projectId/deploy', requireAuth, async (req, res) => {
  const { projectId } = req.params

  // Verify project belongs to user
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', req.user.id)
    .single()

  if (projectError || !project) {
    return res.status(404).json({ error: 'Project not found' })
  }

  // Create deployment record
  const { data: deployment, error: deployError } = await supabase
    .from('deployments')
    .insert({
      project_id: projectId,
      user_id: req.user.id,
      status: 'building',
      logs: '',
    })
    .select()
    .single()

  if (deployError) {
    return res.status(500).json({ error: deployError.message })
  }

  // Update project status
  await supabase
    .from('projects')
    .update({ status: 'building' })
    .eq('id', projectId)

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const deploymentId = deployment.id
  let fullLogs = ''

  function sendLog(message) {
    const line = `[${new Date().toISOString()}] ${message}`
    fullLogs += line + '\n'
    res.write(`data: ${JSON.stringify({ log: line })}\n\n`)
  }

  function sendStatus(status) {
    res.write(`data: ${JSON.stringify({ status })}\n\n`)
  }

  // Simulate deployment pipeline
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  try {
    sendLog(`🚀 Starting deployment for ${project.name}`)
    await sleep(800)

    sendLog(`📦 Cloning repository ${project.repo_full_name}...`)
    await sleep(1200)

    sendLog(`✅ Repository cloned successfully`)
    await sleep(500)

    sendLog(`🔍 Detecting framework and build settings...`)
    await sleep(1000)

    sendLog(`📋 Installing dependencies...`)
    await sleep(2000)

    sendLog(`✅ Dependencies installed`)
    await sleep(500)

    sendLog(`🔨 Building project...`)
    await sleep(2500)

    sendLog(`✅ Build successful`)
    await sleep(500)

    sendLog(`🌍 Deploying to production...`)
    await sleep(1500)

    sendLog(`✅ Deployment successful!`)
    sendLog(`🎉 Your app is live on https://${project.name.toLowerCase()}.deploykit.app`)

    // Update deployment status in DB
    await supabase
      .from('deployments')
      .update({
        status: 'deployed',
        logs: fullLogs,
        finished_at: new Date().toISOString()
      })
      .eq('id', deploymentId)

    // Update project status
    await supabase
      .from('projects')
      .update({ status: 'deployed' })
      .eq('id', projectId)

    sendStatus('deployed')

  } catch (err) {
    sendLog(`❌ Deployment failed: ${err.message}`)

    await supabase
      .from('deployments')
      .update({
        status: 'failed',
        logs: fullLogs,
        finished_at: new Date().toISOString()
      })
      .eq('id', deploymentId)

    await supabase
      .from('projects')
      .update({ status: 'failed' })
      .eq('id', projectId)

    sendStatus('failed')
  }

  res.end()
})

module.exports = router