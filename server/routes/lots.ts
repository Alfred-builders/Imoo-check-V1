import { Router } from 'express'
import { z } from 'zod/v4'
import { query } from '../db/index.js'
import { verifyToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { NotFoundError, AppError } from '../utils/errors.js'

const router = Router()
router.use(verifyToken)

// GET /api/lots/:id — Lot detail
router.get('/:id', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const result = await query(
      `SELECT l.*,
        (SELECT json_build_object('id', b.id, 'designation', b.designation, 'type', b.type)
         FROM batiment b WHERE b.id = l.batiment_id) as batiment,
        (SELECT json_agg(json_build_object(
          'id', t.id, 'nom', t.nom, 'prenom', t.prenom, 'type_personne', t.type_personne,
          'raison_sociale', t.raison_sociale, 'email', t.email, 'tel', t.tel, 'est_principal', lp.est_principal
        )) FROM lot_proprietaire lp JOIN tiers t ON t.id = lp.tiers_id WHERE lp.lot_id = l.id) as proprietaires,
        (SELECT json_build_object('id', t.id, 'nom', t.nom, 'prenom', t.prenom, 'raison_sociale', t.raison_sociale, 'email', t.email)
         FROM tiers t WHERE t.id = l.mandataire_id) as mandataire
      FROM lot l
      WHERE l.id = $1 AND l.workspace_id = $2`,
      [req.params.id, workspaceId]
    )

    if (result.rows.length === 0) throw new NotFoundError('Lot')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

// POST /api/lots — Create lot
const createLotSchema = z.object({
  batiment_id: z.uuid(),
  designation: z.string().min(1).max(255),
  reference_interne: z.string().max(100).optional(),
  type_bien: z.enum(['appartement', 'maison', 'studio', 'local_commercial', 'parking', 'cave', 'autre']),
  nb_pieces: z.enum(['studio', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'autre']).optional(),
  etage: z.string().max(20).optional(),
  emplacement_palier: z.string().max(100).optional(),
  surface: z.number().positive().optional(),
  meuble: z.boolean().optional(),
  dpe_classe: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']).optional(),
  ges_classe: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']).optional(),
  num_cave: z.string().max(50).optional(),
  num_parking: z.string().max(50).optional(),
  commentaire: z.string().optional(),
  mandataire_id: z.uuid().optional(),
})

router.post('/', validate(createLotSchema), async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const d = req.body

    const result = await query(
      `INSERT INTO lot (workspace_id, batiment_id, designation, reference_interne, type_bien,
        nb_pieces, etage, emplacement_palier, surface, meuble, dpe_classe, ges_classe,
        num_cave, num_parking, commentaire, mandataire_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [workspaceId, d.batiment_id, d.designation, d.reference_interne ?? null, d.type_bien,
       d.nb_pieces ?? null, d.etage ?? null, d.emplacement_palier ?? null,
       d.surface ?? null, d.meuble ?? false, d.dpe_classe ?? null, d.ges_classe ?? null,
       d.num_cave ?? null, d.num_parking ?? null, d.commentaire ?? null, d.mandataire_id ?? null]
    )

    sendSuccess(res, result.rows[0], 201)
  } catch (error) {
    sendError(res, error)
  }
})

// PATCH /api/lots/:id — Update lot
router.patch('/:id', async (req, res) => {
  try {
    const workspaceId = req.user!.workspaceId
    const allowedFields = [
      'designation', 'reference_interne', 'type_bien', 'nb_pieces', 'etage',
      'emplacement_palier', 'surface', 'meuble', 'dpe_classe', 'ges_classe',
      'num_cave', 'num_parking', 'commentaire', 'mandataire_id', 'est_archive'
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

    // Archive check: block if active missions
    if (req.body.est_archive === true) {
      const activeMissions = await query(
        `SELECT count(*) as cnt FROM mission WHERE lot_id = $1 AND statut IN ('planifiee', 'assignee')`,
        [req.params.id]
      )
      if (parseInt(activeMissions.rows[0].cnt) > 0) {
        throw new AppError(
          `Impossible d'archiver — ${activeMissions.rows[0].cnt} mission(s) en cours`,
          'ACTIVE_MISSIONS',
          409
        )
      }
    }

    fields.push(`updated_at = now()`)
    values.push(req.params.id, workspaceId)

    const result = await query(
      `UPDATE lot SET ${fields.join(', ')} WHERE id = $${idx++} AND workspace_id = $${idx} RETURNING *`,
      values
    )

    if (result.rows.length === 0) throw new NotFoundError('Lot')
    sendSuccess(res, result.rows[0])
  } catch (error) {
    sendError(res, error)
  }
})

export default router
