import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import { AppError } from './utils/errors.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)
const isProduction = process.env.NODE_ENV === 'production'

// Middleware
app.use(cors({
  origin: isProduction ? process.env.FRONTEND_URL : 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)

// Global error handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message, code: err.code, ...(err.details ? { details: err.details } : {}) })
    return
  }
  console.error('[server] Unhandled error:', err)
  res.status(500).json({ error: 'Erreur interne', code: 'INTERNAL_ERROR' })
})

// Serve frontend in production
if (isProduction) {
  const distPath = path.resolve(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] ImmoChecker running on port ${PORT} (${process.env.NODE_ENV || 'development'})`)
})

export default app
