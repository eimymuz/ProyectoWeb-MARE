import { Router } from 'express'
import pool from '../../config/db.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = Router()

// Convierte fecha ISO a formato YYYY-MM-DD para MariaDB
const formatearFecha = (fecha) => {
  return new Date(fecha).toISOString().slice(0, 10)
}

/* ======================================
   OBTENER DATOS DEL MAPA
   GET /api/mapa
   Devuelve muelles, espacios, zonas de tierra y etiquetas
   Incluye info de asignación activa por espacio si existe
====================================== */

router.get('/', authMiddleware, async (req, res) => {
  try {
    // Muelles
    const [muelles] = await pool.query(
      `SELECT * FROM muelle WHERE estado = 1 ORDER BY nombre ASC`
    )

    // Espacios con info de asignación activa si existe
    const [espacios] = await pool.query(
      `SELECT
        e.*,
        a.id AS asignacion_id,
        a.fecha_inicio,
        a.fecha_fin,
        s.id AS solicitud_id,
        s.estado AS solicitud_estado,
        emb.nombre_bote,
        emb.eslora,
        emb.manga,
        emb.calado,
        tb.tipo_barco,
        c.fullname,
        c.email,
        c.telefono
      FROM espacio e
      LEFT JOIN asignacion_espacios ae ON ae.espacio_id = e.id
      LEFT JOIN asignacion a ON a.id = ae.asignacion_id AND a.activa = 1
      LEFT JOIN solicitud s ON s.id = a.solicitud_id
      LEFT JOIN embarcacion emb ON emb.id = s.embarcacion_id
      LEFT JOIN tipo_barco tb ON tb.id = emb.tipo_barco_id
      LEFT JOIN clientes c ON c.id = emb.cliente_id
      WHERE e.activo = 1`
    )

    // Zonas de tierra
    const [zonas] = await pool.query(`SELECT * FROM zona_tierra`)

    // Etiquetas
    const [etiquetas] = await pool.query(`SELECT * FROM etiqueta_muelle`)

    res.json({
      ok: true,
      muelles,
      espacios,
      zonas,
      etiquetas
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Error al obtener datos del mapa',
      detalle: error.message
    })
  }
})

/* ======================================
   OBTENER SOLICITUDES APROBADAS SIN ASIGNAR
   GET /api/mapa/solicitudes-aprobadas
   Para el panel de asignación del mapa
====================================== */

router.get('/solicitudes-aprobadas', authMiddleware, async (req, res) => {
  try {
    const { reasignar } = req.query

    let sql = `
      SELECT
        s.id,
        s.fecha_llegada,
        s.fecha_salida,
        emb.nombre_bote,
        emb.eslora,
        emb.manga,
        emb.calado,
        tb.tipo_barco,
        c.fullname,
        c.telefono
      FROM solicitud s
      INNER JOIN embarcacion emb ON emb.id = s.embarcacion_id
      INNER JOIN tipo_barco tb ON tb.id = emb.tipo_barco_id
      INNER JOIN clientes c ON c.id = emb.cliente_id
      WHERE s.estado = 'APROBADA'
    `

    // Si no es reasignación, excluye las que ya tienen espacio asignado
    if (!reasignar) {
      sql += ` AND s.id NOT IN (
        SELECT solicitud_id FROM asignacion WHERE activa = 1
      )`
    }

    sql += ` ORDER BY s.fecha_llegada ASC`

    const [solicitudes] = await pool.query(sql)

    res.json({ ok: true, solicitudes })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Error al obtener solicitudes aprobadas',
      detalle: error.message
    })
  }
})

/* ======================================
   ASIGNAR ESPACIO
   POST /api/mapa/asignar
   Crea una asignación entre una solicitud y un espacio
====================================== */

router.post('/asignar', authMiddleware, async (req, res) => {
  const connection = await pool.getConnection()

  try {
    const { solicitud_id, espacio_id, fecha_inicio, fecha_fin } = req.body

    if (!solicitud_id || !espacio_id || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        ok: false,
        error: 'Todos los campos son requeridos'
      })
    }

    // Verifica que el espacio no esté ocupado
    const [ocupado] = await connection.query(
      `SELECT ae.id
       FROM asignacion_espacios ae
       INNER JOIN asignacion a ON a.id = ae.asignacion_id
       WHERE ae.espacio_id = ? AND a.activa = 1
       LIMIT 1`,
      [espacio_id]
    )

    if (ocupado.length > 0) {
      return res.status(400).json({
        ok: false,
        error: 'El espacio ya está ocupado'
      })
    }

    // Obtiene el muelle del espacio
    const [espacioData] = await connection.query(
      `SELECT muelle_id FROM espacio WHERE id = ?`,
      [espacio_id]
    )

    if (espacioData.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Espacio no encontrado'
      })
    }

    await connection.beginTransaction()

    // Crea la asignación
    const [asignacion] = await connection.query(
    `INSERT INTO asignacion (solicitud_id, muelle_id, administrador_id, fecha_inicio, fecha_fin, activa)
    VALUES (?, ?, ?, ?, ?, 1)`,
    [
        solicitud_id,
        espacioData[0].muelle_id,
        req.admin.id,
        formatearFecha(fecha_inicio),  // 
        formatearFecha(fecha_fin)      // 
    ]
    )
        // Vincula el espacio a la asignación
    await connection.query(
      `INSERT INTO asignacion_espacios (asignacion_id, espacio_id) VALUES (?, ?)`,
      [asignacion.insertId, espacio_id]
    )

    await connection.commit()

    res.status(201).json({
      ok: true,
      message: 'Espacio asignado correctamente',
      asignacion_id: asignacion.insertId
    })
  } catch (error) {
    await connection.rollback()
    res.status(500).json({
      ok: false,
      error: 'Error al asignar espacio',
      detalle: error.message
    })
  } finally {
    connection.release()
  }
})

/* ======================================
   DESASIGNAR ESPACIO
   PATCH /api/mapa/asignacion/:id/desactivar
   Libera un espacio desactivando su asignación
====================================== */

router.patch('/asignacion/:id/desactivar', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    await pool.query(
      `UPDATE asignacion SET activa = 0 WHERE id = ?`,
      [id]
    )

    res.json({ ok: true, message: 'Asignación desactivada correctamente' })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Error al desactivar asignación',
      detalle: error.message
    })
  }
})


/* ======================================
   OBTENER ASIGNACIONES ACTIVAS
   GET /api/mapa/asignaciones
   Lista solicitudes aprobadas con su espacio asignado
====================================== */
router.get('/asignaciones', authMiddleware, async (req, res) => {
  try {
    const [asignaciones] = await pool.query(
      `SELECT
        s.id AS solicitud_id,
        s.fecha_llegada,
        s.fecha_salida,
        s.estado,
        emb.nombre_bote,
        emb.eslora,
        emb.manga,
        emb.calado,
        tb.tipo_barco,
        c.fullname,
        c.email,
        c.telefono,
        a.id AS asignacion_id,
        a.fecha_inicio,
        a.fecha_fin,
        m.nombre AS muelle_nombre,
        e.numero AS espacio_numero
      FROM asignacion a
      INNER JOIN solicitud s ON s.id = a.solicitud_id
      INNER JOIN embarcacion emb ON emb.id = s.embarcacion_id
      INNER JOIN tipo_barco tb ON tb.id = emb.tipo_barco_id
      INNER JOIN clientes c ON c.id = emb.cliente_id
      INNER JOIN muelle m ON m.id = a.muelle_id
      INNER JOIN asignacion_espacios ae ON ae.asignacion_id = a.id
      INNER JOIN espacio e ON e.id = ae.espacio_id
      WHERE a.activa = 1
      ORDER BY s.fecha_salida ASC`
    )

    res.json({ ok: true, asignaciones })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Error al obtener asignaciones',
      detalle: error.message
    })
  }
})




/* ======================================
   DESACTIVAR ASIGNACIÓN POR SOLICITUD
   PATCH /api/mapa/asignacion/por-solicitud/:solicitudId/desactivar
====================================== */
router.patch('/asignacion/por-solicitud/:solicitudId/desactivar', authMiddleware, async (req, res) => {
  try {
    const { solicitudId } = req.params

    await pool.query(
      `UPDATE asignacion SET activa = 0 WHERE solicitud_id = ? AND activa = 1`,
      [solicitudId]
    )

    res.json({ ok: true, message: 'Asignación anterior desactivada' })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Error al desactivar asignación',
      detalle: error.message
    })
  }
})




export default router