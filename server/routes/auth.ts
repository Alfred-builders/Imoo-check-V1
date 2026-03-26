import { Router } from 'express'
import { z } from 'zod/v4'
import * as authService from '../services/auth-service.js'
import { verifyToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendSuccess, sendError } from '../utils/response.js'

const router = Router()

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

// Login
const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await authService.login(email, password)

    if (result.workspaces.length === 1) {
      // Single workspace — auto-switch
      const ws = result.workspaces[0]
      const { accessToken, refreshToken } = await authService.switchWorkspace(result.user.id, ws.id)

      res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 30 * 60 * 1000 })
      res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 })

      sendSuccess(res, {
        user: result.user,
        workspace: ws,
        requireWorkspaceSelect: false,
      })
    } else {
      // Multiple workspaces — user must select
      sendSuccess(res, {
        user: result.user,
        workspaces: result.workspaces,
        requireWorkspaceSelect: true,
      })
    }
  } catch (error) {
    sendError(res, error)
  }
})

// Switch workspace (after login or from header switcher)
const switchSchema = z.object({
  workspaceId: z.uuid(),
})

router.post('/switch-workspace', async (req, res) => {
  try {
    // User must be at least partially authenticated (have userId from login response)
    const userId = req.body.userId || req.user?.userId
    if (!userId) {
      sendError(res, { status: 401, message: 'Non authentifié', code: 'UNAUTHORIZED' })
      return
    }

    const { workspaceId } = switchSchema.parse(req.body)
    const { accessToken, refreshToken, payload } = await authService.switchWorkspace(userId, workspaceId)

    res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 30 * 60 * 1000 })
    res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 })

    sendSuccess(res, { user: payload })
  } catch (error) {
    sendError(res, error)
  }
})

// Register via invitation
const registerSchema = z.object({
  token: z.uuid(),
  nom: z.string().min(1).max(255),
  prenom: z.string().min(1).max(255),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins 1 majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins 1 chiffre'),
})

router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { token, nom, prenom, password } = req.body
    const result = await authService.register(token, nom, prenom, password)

    // Auto-login after registration
    const { accessToken, refreshToken } = await authService.switchWorkspace(result.userId, result.workspaceId)

    res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 30 * 60 * 1000 })
    res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 })

    sendSuccess(res, {
      user: { userId: result.userId, email: result.email, workspaceId: result.workspaceId, role: result.role },
    }, 201)
  } catch (error) {
    sendError(res, error)
  }
})

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const refreshTokenValue = req.cookies?.refresh_token
    if (!refreshTokenValue) {
      sendError(res, { status: 401, message: 'Refresh token manquant', code: 'UNAUTHORIZED' })
      return
    }

    const userId = await authService.verifyRefreshToken(refreshTokenValue)

    // Get current workspace from expired access token (if any)
    let workspaceId: string | undefined
    try {
      const decoded = JSON.parse(
        Buffer.from((req.cookies?.access_token || '').split('.')[1] || 'e30=', 'base64').toString()
      )
      workspaceId = decoded.workspaceId
    } catch {
      // ignore
    }

    if (!workspaceId) {
      sendError(res, { status: 401, message: 'Workspace inconnu', code: 'UNAUTHORIZED' })
      return
    }

    const { accessToken, refreshToken: newRefreshToken } = await authService.switchWorkspace(userId, workspaceId)

    res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 30 * 60 * 1000 })
    res.cookie('refresh_token', newRefreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 })

    sendSuccess(res, { refreshed: true })
  } catch (error) {
    sendError(res, error)
  }
})

// Logout
router.post('/logout', (_req, res) => {
  res.clearCookie('access_token', COOKIE_OPTIONS)
  res.clearCookie('refresh_token', COOKIE_OPTIONS)
  sendSuccess(res, { message: 'Déconnecté' })
})

// Get current user info (requires auth)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const { rows } = await import('../db/index.js').then(db =>
      db.query(
        `SELECT u.id, u.email, u.nom, u.prenom, w.id as workspace_id, w.nom as workspace_nom,
                w.type_workspace, w.logo_url, wu.role
         FROM utilisateur u
         JOIN workspace_user wu ON wu.user_id = u.id
         JOIN workspace w ON w.id = wu.workspace_id
         WHERE u.id = $1 AND w.id = $2`,
        [req.user!.userId, req.user!.workspaceId]
      )
    )

    if (rows.length === 0) {
      sendError(res, { status: 404, message: 'Utilisateur introuvable', code: 'NOT_FOUND' })
      return
    }

    const row = rows[0]
    sendSuccess(res, {
      id: row.id,
      email: row.email,
      nom: row.nom,
      prenom: row.prenom,
      workspace: {
        id: row.workspace_id,
        nom: row.workspace_nom,
        type_workspace: row.type_workspace,
        logo_url: row.logo_url,
      },
      role: row.role,
    })
  } catch (error) {
    sendError(res, error)
  }
})

// Validate invitation token
router.get('/invitation/:token', async (req, res) => {
  try {
    const { rows } = await import('../db/index.js').then(db =>
      db.query(
        `SELECT i.email, i.role, w.nom as workspace_nom, w.logo_url
         FROM invitation i
         JOIN workspace w ON w.id = i.workspace_id
         WHERE i.token = $1 AND i.accepted_at IS NULL AND i.expires_at > now()`,
        [req.params.token]
      )
    )

    if (rows.length === 0) {
      sendSuccess(res, { valid: false, expired: true })
      return
    }

    sendSuccess(res, {
      valid: true,
      email: rows[0].email,
      role: rows[0].role,
      workspace_nom: rows[0].workspace_nom,
      workspace_logo: rows[0].logo_url,
    })
  } catch (error) {
    sendError(res, error)
  }
})

export default router
