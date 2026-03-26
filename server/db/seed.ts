import { pool, query } from './index.js'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('[seed] Starting seed...')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1. Demo workspace: Flat Checker
    const wsResult = await client.query(
      `INSERT INTO workspace (nom, type_workspace, statut, email, siret)
       VALUES ('Flat Checker', 'societe_edl', 'actif', 'contact@flatchecker.fr', '12345678901234')
       ON CONFLICT DO NOTHING
       RETURNING id`
    )

    let workspaceId: string
    if (wsResult.rows.length > 0) {
      workspaceId = wsResult.rows[0].id
      console.log('[seed] Workspace Flat Checker created:', workspaceId)
    } else {
      const existing = await client.query(`SELECT id FROM workspace WHERE nom = 'Flat Checker'`)
      workspaceId = existing.rows[0].id
      console.log('[seed] Workspace Flat Checker already exists:', workspaceId)
    }

    // 2. Admin user
    const passwordHash = await bcrypt.hash('Admin1234', 12)
    const userResult = await client.query(
      `INSERT INTO utilisateur (email, nom, prenom, password_hash)
       VALUES ('admin@flatchecker.fr', 'Admin', 'Flat Checker', $1)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
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
       VALUES ($1, $2, 'admin')
       ON CONFLICT (workspace_id, user_id) DO NOTHING`,
      [workspaceId, adminId]
    )
    console.log('[seed] Admin user ready:', adminId)

    // 3. Sample buildings
    const buildings = [
      { designation: 'Résidence Les Lilas', type: 'immeuble', nb_etages: 5 },
      { designation: 'Maison Dupont', type: 'maison', nb_etages: 2 },
      { designation: 'Immeuble Victor Hugo', type: 'immeuble', nb_etages: 8 },
    ]

    const buildingIds: string[] = []
    for (const b of buildings) {
      const res = await client.query(
        `INSERT INTO batiment (workspace_id, designation, type, nb_etages)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [workspaceId, b.designation, b.type, b.nb_etages]
      )
      buildingIds.push(res.rows[0].id)
    }

    // Add addresses
    const addresses = [
      { batiment_id: buildingIds[0], type: 'principale', rue: '12 Rue des Lilas', code_postal: '75011', ville: 'Paris', latitude: 48.8601, longitude: 2.3815 },
      { batiment_id: buildingIds[1], type: 'principale', rue: '45 Avenue de la République', code_postal: '92100', ville: 'Boulogne-Billancourt', latitude: 48.8396, longitude: 2.2399 },
      { batiment_id: buildingIds[2], type: 'principale', rue: '8 Boulevard Victor Hugo', code_postal: '75015', ville: 'Paris', latitude: 48.8425, longitude: 2.2920 },
    ]

    for (const a of addresses) {
      await client.query(
        `INSERT INTO adresse_batiment (batiment_id, type, rue, code_postal, ville, latitude, longitude, ordre)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 1)`,
        [a.batiment_id, a.type, a.rue, a.code_postal, a.ville, a.latitude, a.longitude]
      )
    }

    // 4. Sample lots
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
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [workspaceId, l.batiment_id, l.designation, l.type_bien, l.etage, l.surface, l.meuble]
      )
      lotIds.push(res.rows[0].id)
    }

    // 5. Sample tiers
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
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [workspaceId, t.type, t.nom, t.prenom ?? null, (t as any).raison_sociale ?? null, (t as any).siren ?? null, t.email ?? null, t.tel ?? null]
      )
      tiersIds.push(res.rows[0].id)
    }

    // Link owners to lots
    await client.query(
      `INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`,
      [lotIds[0], tiersIds[0]]
    )
    await client.query(
      `INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`,
      [lotIds[1], tiersIds[2]]
    )
    await client.query(
      `INSERT INTO lot_proprietaire (lot_id, tiers_id, est_principal) VALUES ($1, $2, true)`,
      [lotIds[3], tiersIds[1]]
    )

    await client.query('COMMIT')
    console.log('[seed] Demo data seeded successfully')
    console.log(`  - 1 workspace (Flat Checker)`)
    console.log(`  - 1 admin (admin@flatchecker.fr / Admin1234)`)
    console.log(`  - ${buildings.length} bâtiments, ${lots.length} lots, ${tiers.length} tiers`)
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
