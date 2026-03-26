import { pool } from './index.js'
import bcrypt from 'bcryptjs'
import { typePieces } from './seed-data/type-pieces.js'
import { catalogueItems, valeursReferentiel } from './seed-data/catalogue-items.js'
import { templatePieceItems } from './seed-data/template-piece-items.js'

async function seed() {
  console.log('[seed] Starting seed...')
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // ========================================
    // 1. Demo workspace + admin
    // ========================================
    const wsResult = await client.query(
      `INSERT INTO workspace (nom, type_workspace, statut, email, siret)
       VALUES ('Flat Checker', 'societe_edl', 'actif', 'contact@flatchecker.fr', '12345678901234')
       ON CONFLICT DO NOTHING RETURNING id`
    )
    let workspaceId: string
    if (wsResult.rows.length > 0) {
      workspaceId = wsResult.rows[0].id
    } else {
      const existing = await client.query(`SELECT id FROM workspace WHERE nom = 'Flat Checker'`)
      workspaceId = existing.rows[0].id
    }
    console.log('[seed] Workspace:', workspaceId)

    const passwordHash = await bcrypt.hash('Admin1234', 12)
    const userResult = await client.query(
      `INSERT INTO utilisateur (email, nom, prenom, password_hash)
       VALUES ('admin@flatchecker.fr', 'Admin', 'Flat Checker', $1)
       ON CONFLICT (email) DO NOTHING RETURNING id`,
      [passwordHash]
    )
    let adminId: string
    if (userResult.rows.length > 0) {
      adminId = userResult.rows[0].id
    } else {
      const existing = await client.query(`SELECT id FROM utilisateur WHERE email = 'admin@flatchecker.fr'`)
      adminId = existing.rows[0].id
    }
    await client.query(
      `INSERT INTO workspace_user (workspace_id, user_id, role)
       VALUES ($1, $2, 'admin') ON CONFLICT (workspace_id, user_id) DO NOTHING`,
      [workspaceId, adminId]
    )
    console.log('[seed] Admin:', adminId)

    // ========================================
    // 2. Sample buildings + lots + tiers
    // ========================================
    const buildings = [
      { designation: 'Résidence Les Lilas', type: 'immeuble', nb_etages: 5 },
      { designation: 'Maison Dupont', type: 'maison', nb_etages: 2 },
      { designation: 'Immeuble Victor Hugo', type: 'immeuble', nb_etages: 8 },
    ]
    const buildingIds: string[] = []
    for (const b of buildings) {
      const res = await client.query(
        `INSERT INTO batiment (workspace_id, designation, type, nb_etages)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [workspaceId, b.designation, b.type, b.nb_etages]
      )
      buildingIds.push(res.rows[0].id)
    }

    const addresses = [
      { batiment_id: buildingIds[0], rue: '12 Rue des Lilas', code_postal: '75011', ville: 'Paris', lat: 48.8601, lng: 2.3815 },
      { batiment_id: buildingIds[1], rue: '45 Avenue de la République', code_postal: '92100', ville: 'Boulogne-Billancourt', lat: 48.8396, lng: 2.2399 },
      { batiment_id: buildingIds[2], rue: '8 Boulevard Victor Hugo', code_postal: '75015', ville: 'Paris', lat: 48.8425, lng: 2.2920 },
    ]
    for (const a of addresses) {
      await client.query(
        `INSERT INTO adresse_batiment (batiment_id, type, rue, code_postal, ville, latitude, longitude, ordre)
         VALUES ($1, 'principale', $2, $3, $4, $5, $6, 1)`,
        [a.batiment_id, a.rue, a.code_postal, a.ville, a.lat, a.lng]
      )
    }

    const lots = [
      { batiment_id: buildingIds[0], designation: 'Appartement 201', type_bien: 'appartement', etage: '2', surface: 65, meuble: false },
      { batiment_id: buildingIds[0], designation: 'Appartement 302', type_bien: 'appartement', etage: '3', surface: 42, meuble: true },
      { batiment_id: buildingIds[0], designation: 'Appartement 101', type_bien: 'appartement', etage: '1', surface: 78, meuble: false },
      { batiment_id: buildingIds[1], designation: 'Maison Dupont', type_bien: 'maison', etage: 'RDC', surface: 120, meuble: false },
      { batiment_id: buildingIds[2], designation: 'Bureau 4A', type_bien: 'local_commercial', etage: '4', surface: 55, meuble: true },
    ]
    const lotIds: string[] = []
    for (const l of lots) {
      const res = await client.query(
        `INSERT INTO lot (workspace_id, batiment_id, designation, type_bien, etage, surface, meuble)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [workspaceId, l.batiment_id, l.designation, l.type_bien, l.etage, l.surface, l.meuble]
      )
      lotIds.push(res.rows[0].id)
    }

    const tiers = [
      { type: 'physique', nom: 'Martin', prenom: 'Jean', email: 'jean.martin@email.com', tel: '06 12 34 56 78' },
      { type: 'physique', nom: 'Dubois', prenom: 'Sophie', email: 'sophie.dubois@email.com', tel: '06 98 76 54 32' },
      { type: 'morale', nom: 'SCI Les Hêtres', raison_sociale: 'SCI Les Hêtres', siren: '123456789', email: 'contact@scileshetres.fr' },
      { type: 'physique', nom: 'Petit', prenom: 'Lucas', email: 'lucas.petit@email.com' },
    ]
    const tiersIds: string[] = []
    for (const t of tiers) {
      const res = await client.query(
        `INSERT INTO tiers (workspace_id, type_personne, nom, prenom, raison_sociale, siren, email, tel)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [workspaceId, t.type, t.nom, t.prenom ?? null, (t as any).raison_sociale ?? null, (t as any).siren ?? null, t.email ?? null, t.tel ?? null]
      )
      tiersIds.push(res.rows[0].id)
    }

    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[0], tiersIds[0]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[1], tiersIds[2]])
    await client.query(`INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`, [lotIds[3], tiersIds[1]])

    console.log(`[seed] Demo: ${buildings.length} bâtiments, ${lots.length} lots, ${tiers.length} tiers`)

    // ========================================
    // 3. Type Pieces (plateforme)
    // ========================================
    let piecesInserted = 0
    const pieceIdMap = new Map<string, string>()

    for (const p of typePieces) {
      const res = await client.query(
        `INSERT INTO type_piece (workspace_id, nom, icon, categorie_piece, source, ordre_affichage)
         VALUES (NULL, $1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING RETURNING id`,
        [p.nom, p.icon, p.categorie_piece, p.source, p.ordre_affichage]
      )
      if (res.rows.length > 0) {
        pieceIdMap.set(p.nom, res.rows[0].id)
        piecesInserted++
      } else {
        const existing = await client.query(`SELECT id FROM type_piece WHERE nom = $1 AND workspace_id IS NULL`, [p.nom])
        if (existing.rows.length > 0) pieceIdMap.set(p.nom, existing.rows[0].id)
      }
    }
    console.log(`[seed] TypePiece: ${piecesInserted} inserted (${typePieces.length} total)`)

    // ========================================
    // 4. Catalogue Items (plateforme)
    // ========================================
    // First pass: top-level items (parent_nom = null)
    let itemsInserted = 0
    const itemIdMap = new Map<string, string>()

    const topLevel = catalogueItems.filter(i => i.parent_nom === null)
    const subItems = catalogueItems.filter(i => i.parent_nom !== null)

    for (const item of topLevel) {
      const res = await client.query(
        `INSERT INTO catalogue_item (workspace_id, parent_item_id, nom, categorie, contexte, source, ordre_affichage)
         VALUES (NULL, NULL, $1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING RETURNING id`,
        [item.nom, item.categorie, item.contexte, item.source, item.ordre_affichage]
      )
      if (res.rows.length > 0) {
        itemIdMap.set(item.nom, res.rows[0].id)
        itemsInserted++
      } else {
        const existing = await client.query(`SELECT id FROM catalogue_item WHERE nom = $1 AND workspace_id IS NULL AND parent_item_id IS NULL`, [item.nom])
        if (existing.rows.length > 0) itemIdMap.set(item.nom, existing.rows[0].id)
      }
    }

    // Second pass: sub-items
    for (const item of subItems) {
      const parentId = itemIdMap.get(item.parent_nom!)
      if (!parentId) {
        console.warn(`[seed] Skipping sub-item "${item.nom}" — parent "${item.parent_nom}" not found`)
        continue
      }
      const res = await client.query(
        `INSERT INTO catalogue_item (workspace_id, parent_item_id, nom, categorie, contexte, source, ordre_affichage)
         VALUES (NULL, $1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING RETURNING id`,
        [parentId, item.nom, item.categorie, item.contexte, item.source, item.ordre_affichage]
      )
      if (res.rows.length > 0) {
        itemIdMap.set(item.nom, res.rows[0].id)
        itemsInserted++
      }
    }
    console.log(`[seed] CatalogueItem: ${itemsInserted} inserted (${catalogueItems.length} total)`)

    // ========================================
    // 5. Valeurs Referentiel (plateforme)
    // ========================================
    let refsInserted = 0
    for (const v of valeursReferentiel) {
      const itemId = itemIdMap.get(v.item_nom)
      if (!itemId) continue
      // Map type to critere enum
      const critere = v.type === 'caracteristique' ? 'caracteristiques' : 'degradations'
      const res = await client.query(
        `INSERT INTO valeur_referentiel (catalogue_item_id, workspace_id, critere, valeur, source, ordre_affichage)
         VALUES ($1, NULL, $2, $3, 'plateforme', $4)
         ON CONFLICT DO NOTHING RETURNING id`,
        [itemId, critere, v.valeur, v.ordre_affichage]
      )
      if (res.rows.length > 0) refsInserted++
    }
    console.log(`[seed] ValeurReferentiel: ${refsInserted} inserted (${valeursReferentiel.length} total)`)

    // ========================================
    // 6. Template Piece-Items (plateforme)
    // ========================================
    let templatesInserted = 0
    for (const t of templatePieceItems) {
      const pieceId = pieceIdMap.get(t.piece_nom)
      const itemId = itemIdMap.get(t.item_nom)
      if (!pieceId || !itemId) {
        if (!pieceId) console.warn(`[seed] Template skip — piece "${t.piece_nom}" not found`)
        if (!itemId) console.warn(`[seed] Template skip — item "${t.item_nom}" not found`)
        continue
      }
      const res = await client.query(
        `INSERT INTO template_piece_item (type_piece_id, catalogue_item_id, workspace_id, quantite_defaut, ordre_affichage)
         VALUES ($1, $2, NULL, $3, $4)
         ON CONFLICT DO NOTHING RETURNING id`,
        [pieceId, itemId, t.quantite_defaut, templatesInserted + 1]
      )
      if (res.rows.length > 0) templatesInserted++
    }
    console.log(`[seed] TemplatePieceItem: ${templatesInserted} inserted (${templatePieceItems.length} total)`)

    // ========================================
    // 7. Config Critere Categorie (defaults pour workspace Flat Checker)
    // ========================================
    const categories = [
      'revetement_sol', 'revetement_mur', 'revetement_plafond', 'menuiserie',
      'plomberie', 'electricite', 'chauffage', 'ventilation', 'electromenager',
      'mobilier', 'equipement', 'serrurerie', 'vitrage', 'exterieur', 'divers',
      'structure', 'securite'
    ]
    let configsInserted = 0
    for (const cat of categories) {
      const res = await client.query(
        `INSERT INTO config_critere_categorie
         (workspace_id, categorie, etat_general, proprete, photos, caracteristiques, couleur, degradations, fonctionnement, quantite)
         VALUES ($1, $2, 'obligatoire', 'recommande', 'recommande', 'optionnel', 'optionnel', 'recommande', 'optionnel', 'masque')
         ON CONFLICT (workspace_id, categorie) DO NOTHING RETURNING id`,
        [workspaceId, cat]
      )
      if (res.rows.length > 0) configsInserted++
    }
    console.log(`[seed] ConfigCritereCategorie: ${configsInserted} inserted (${categories.length} categories)`)

    await client.query('COMMIT')
    console.log('[seed] All seed data inserted successfully!')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[seed] Seed failed:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
