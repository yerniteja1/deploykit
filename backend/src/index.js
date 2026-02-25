const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { PORT, CLIENT_URL } = require('./config')
const authRoutes = require('./routes/auth')

const app = express()

app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'DeployKit API is running' })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})