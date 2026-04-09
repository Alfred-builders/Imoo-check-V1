import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import batimentRoutes from './routes/batiments.js'
import lotRoutes from './routes/lots.js'
import preferenceRoutes from './routes/preferences.js'
import invitationRoutes from './routes/invitations.js'
import workspaceRoutes from './routes/workspaces.js'
import tiersRoutes from './routes/tiers.js'
import { AppError } from './utils/errors.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Don't let .env override Railway's environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: false })

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)
const isRailway = !!process.env.RAILWAY_ENVIRONMENT
const isDev = !isRailway && process.env.NODE_ENV === 'development'

// Middleware
app.use(cors({
  origin: isDev
    ? 'http://localhost:5173'
    : (process.env.FRONTEND_URL || true),
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/batiments', batimentRoutes)
app.use('/api/lots', lotRoutes)
app.use('/api/preferences', preferenceRoutes)
app.use('/api/invitations', invitationRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/tiers', tiersRoutes)

// Serve frontend (always in non-dev — Railway, staging, production)
if (!isDev) {
  const distPath = path.resolve(__dirname, '..', 'dist')
  console.log(`[server] Serving frontend from: ${distPath}`)
  app.use(express.static(distPath))
  app.get('{*path}', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// Global error handler (must be AFTER all routes and static serving)
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message, code: err.code, ...(err.details ? { details: err.details } : {}) })
    return
  }
  console.error('[server] Unhandled error:', err)
  res.status(500).json({ error: 'Erreur interne', code: 'INTERNAL_ERROR' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] ImmoChecker running on port ${PORT} (${process.env.NODE_ENV || 'production'})`)
})

export default app
