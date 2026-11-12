import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path' 
import { fileURLToPath } from 'url'
import errorHandler from './middleware/errorHandler.js'
import testRouter from './routes/testRouter.js'
import movieRoutes from './routes/movieRoutes.js'
import dbRoutes from './routes/dbRoutes.js'

const port = process.env.PORT || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

//Sallitaan frontendin lähettää ja vastaanottaa cookieita. 
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/api/tests', testRouter)
app.use('/movies', movieRoutes)
app.use('/api/db', dbRoutes)

// Health check endpoint for database connectivity
app.get('/api/health', async (req, res) => {
  try {
    const { pool } = await import('./models/db.js')
    await pool.query('SELECT 1')
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

app.use(express.static(path.join(__dirname, '../dist')))

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next()
  }

  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

app.use((req, res, next) => {
  const error = new Error('Not found')
  error.status = 404
  next(error)
})

app.use(errorHandler)

app.listen(port, () => {  
  console.log(`Server is running on http://localhost:${port}`)
  console.log('Backend hot reload is working!')
})