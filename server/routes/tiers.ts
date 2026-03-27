import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../db/index.js'
import { verifyToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendSuccess, sendList, sendError } from '../utils/response.js'
import { NotFoundError, AppError } from '../utils/errors.js'

const router = Router()
router.use(verifyToken)

// GET /api/tiers — List tiers with search, filters, pagination
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const { search, type_personne, role, archived, cursor, limit: rawLimit } = req.query
    const limit = Math.min(parseInt(rawLimit as string) || 50, 100)

    let where = `t.workspace_id = $1 AND t.est_archive = $2`
    const params: unknown[] = [workspaceId, archived === 'true']
    let paramIndex = 3

    if (search) {
      where += ` AND (t.nom ILIKE $${paramIndex} OR t.prenom ILIKE $${paramIndex} OR t.raison_sociale ILIKE $${paramIndex} OR t.email ILIKE $${paramIndex} OR t.tel ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (type_personne && type_personne !== 'all') {
      where += ` AND t.type_personne = $${paramIndex}`
      params.push(type_personne)
      paramIndex++
    }

    // Role filter: proprietaire, locataire, mandataire
    let roleJoin = ''
    if (role === 'proprietaire') {
      roleJoin = `AND EXISTS (SELECT 1 FROM lot_proprietaire lp WHERE lp.tiers_id = t.id)`
    } else if (role === 'mandataire') {
      roleJoin = `AND EXISTS (SELECT 1 FROM lot l WHERE l.mandataire_id = t.id AND l.est_archive = false)`
    } else if (role === 'locataire') {
      roleJoin = `AND EXISTS (SELECT 1 FROM edl_locataire el WHERE el.tiers_id = t.id)`
    }

    if (cursor) {
      where += ` AND t.id > $${paramIndex}`
      params.push(cursor)
      paramIndex++
    }

    const sql = `
      SELECT t.*,
        (SELECT count(*) FROM lot_proprietaire lp WHERE lp.tiers_id = t.id)::int as nb_lots_proprio,
        (SELECT count(*) FROM lot l WHERE l.mandataire_id = t.id AND l.est_archive = false)::int as nb_lots_mandataire,
        (SELECT count(*) FROM edl_locataire el WHERE el.tiers_id = t.id)::int as nb_edl_locataire
      FROM tiers t
      WHERE ${where} ${roleJoin}
      ORDER BY t.nom ASC, t.prenom ASC
      LIMIT $${paramIndex}
    `
    params.push(limit + 1)

    const result = await query(sql, params)
    const hasMore = result.rows.length > limit
    const data = hasMore ? result.rows.slice(0, limit) : result.rows
    const nextCursor = hasMore ? data[data.length - 1].id : undefined

    sendList(res, data, { cursor: nextCursor, has_more: hasMore })
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/tiers/:id — Tiers detail
router.get('/:id', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const result = await query(
      `SELECT t.*,
        (SELECT json_agg(json_build_object('id', l.id, 'designation', l.designation, 'type_bien', l.type_bien,
          'batiment_designation', b.designation, 'est_principal', lp.est_principal))
         FROM lot_proprietaire lp JOIN lot l ON l.id = lp.lot_id JOIN batiment b ON b.id = l.batiment_id
         WHERE lp.tiers_id = t.id AND l.est_archive = false) as lots_proprietaire,
        (SELECT json_agg(json_build_object('id', l.id, 'designation', l.designation, 'type_bien', l.type_bien,
          'batiment_designation', b.designation))
         FROM lot l JOIN batiment b ON b.id = l.batiment_id
         WHERE l.mandataire_id = t.id AND l.est_archive = false) as lots_mandataire,
        (SELECT json_agg(json_build_object('tiers_id', to2.id, 'nom', to2.nom, 'raison_sociale', to2.raison_sociale, 'fonction', torg.fonction, 'est_principal', torg.est_principal))
         FROM tiers_organisation torg JOIN tiers to2 ON to2.id = torg.organisation_id
         WHERE torg.tiers_id = t.id) as organisations,
        (SELECT json_agg(json_build_object('tiers_id', to3.id, 'nom', to3.nom, 'prenom', to3.prenom, 'fonction', torg2.fonction, 'est_principal', torg2.est_principal))
         FROM tiers_organisation torg2 JOIN tiers to3 ON to3.id = torg2.tiers_id
         WHERE torg2.organisation_id = t.id) as membres
      FROM tiers t
      WHERE t.id = $1 AND t.workspace_id = $2`,
      [req.params.id, workspaceId]
    )
    if (result.rows.length === 0) throw new NotFoundError('Tiers')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/tiers — Create tiers
const createTiersSchema = z.object({
  type_personne: z.enum(['physique', 'morale']),
  nom: z.string().min(1).max(255),
  prenom: z.string().max(255).optional(),
  raison_sociale: z.string().max(255).optional(),
  siren: z.string().max(14).optional(),
  email: z.string().email().optional().or(z.literal('')),
  tel: z.string().max(20).optional(),
  adresse: z.string().max(500).optional(),
  code_postal: z.string().max(10).optional(),
  ville: z.string().max(255).optional(),
  date_naissance: z.string().optional(),
  representant_nom: z.string().max(255).optional(),
  notes: z.string().optional(),
})

router.post('/', validate(createTiersSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const d = req.body

    // Non-blocking duplicate warning
    let warning: string | undefined
    if (d.email) {
      const existing = await query(
        `SELECT id FROM tiers WHERE email = $1 AND workspace_id = $2 AND est_archive = false`,
        [d.email, workspaceId]
      )
      if (existing.rows.length > 0) {
        warning = 'Un tiers avec cet email existe deja'
      }
    }

    const result = await query(
      `INSERT INTO tiers (workspace_id, type_personne, nom, prenom, raison_sociale, siren, email, tel, adresse, code_postal, ville, date_naissance, representant_nom, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [workspaceId, d.type_personne, d.nom, d.prenom ?? null, d.raison_sociale ?? null, d.siren ?? null,
       d.email || null, d.tel ?? null, d.adresse ?? null, d.code_postal ?? null, d.ville ?? null,
       d.date_naissance ?? null, d.representant_nom ?? null, d.notes ?? null]
    )

    sendSuccess(res, { ...result.rows[0], warning }, 201)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/tiers/:id — Update tiers
router.patch('/:id', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const allowedFields = [
      'nom', 'prenom', 'raison_sociale', 'siren', 'email', 'tel',
      'adresse', 'code_postal', 'ville', 'date_naissance', 'representant_nom', 'notes', 'est_archive'
    ]

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
    values.push(req.params.id, workspaceId)

    const result = await query(
      `UPDATE tiers SET ${fields.join(', ')} WHERE id = $${idx++} AND workspace_id = $${idx} RETURNING *`,
      values
    )
    if (result.rows.length === 0) throw new NotFoundError('Tiers')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// GET /api/tiers/stats — Count by role
router.get('/stats/counts', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const result = await query(`
      SELECT
        count(*) FILTER (WHERE est_archive = false)::int as total,
        count(*) FILTER (WHERE type_personne = 'physique' AND est_archive = false)::int as physiques,
        count(*) FILTER (WHERE type_personne = 'morale' AND est_archive = false)::int as morales,
        (SELECT count(DISTINCT lp.tiers_id) FROM lot_proprietaire lp JOIN tiers t2 ON t2.id = lp.tiers_id WHERE t2.workspace_id = $1 AND t2.est_archive = false)::int as proprietaires,
        (SELECT count(DISTINCT l.mandataire_id) FROM lot l WHERE l.workspace_id = $1 AND l.mandataire_id IS NOT NULL AND l.est_archive = false)::int as mandataires
      FROM tiers WHERE workspace_id = $1
    `, [workspaceId])
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

export default router
