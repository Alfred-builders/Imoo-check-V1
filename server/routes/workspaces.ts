import { Router } from 'express'
import { query } from '../db/index.js'
import { verifyToken, requireRole } from '../middleware/auth.js'
import { sendSuccess, sendError } from '../utils/response.js'

const router = Router()
router.use(verifyToken)

// GET /api/workspaces/current — Get current workspace details
router.get('/current', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM workspace WHERE id = $1`,
      [req.user!.workspaceId]
    )
    if (result.rows.length === 0) {
      sendError(res, { status: 404, message: 'Workspace introuvable', code: 'NOT_FOUND' })
      return
    }
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/workspaces/current — Update current workspace (admin only)
router.patch('/current', requireRole('admin'), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const allowedFields = ['nom', 'siret', 'email', 'telephone', 'adresse', 'code_postal', 'ville', 'logo_url', 'couleur_primaire']

    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        fields.push(`${field} = $${idx++}`)
        values.push(req.body[field])
      }
    }

    if (fields.length === 0) {
      sendSuccess(res, { message: 'Aucune modification' })
      return
    }

    fields.push(`updated_at = now()`)
    values.push(workspaceId)

    const result = await query(
      `UPDATE workspace SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )

    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

export default router
