import { Router } from 'express'
import pool from '../../config/db.js'

const router = Router()

const ESTADOS_VALIDOS = [
  'PENDIENTE',
  'EN_ESPERA',
  'APROBADA',
  'COMPLETADA',
  'RECHAZADA'
]

/* ======================================
   OBTENER SOLICITUDES
====================================== */

router.get('/', async (req, res) => {
  try {
    const { estado } = req.query

    let sql = `
      SELECT
        s.id,
        s.fecha_solicitud,
        s.fecha_llegada,
        s.fecha_salida,
        s.estado,
        s.comentario,
        s.primera_entrada_mexico,
        s.motivo_rechazo,

        e.id AS embarcacion_id,
        e.nombre_bote,
        e.eslora,
        e.manga,
        e.calado,

        c.id AS cliente_id,
        c.fullname,
        c.email,
        c.telefono,

        tb.id AS tipo_barco_id,
        tb.tipo_barco
      FROM solicitud s
      INNER JOIN embarcacion e ON s.embarcacion_id = e.id
      INNER JOIN clientes c ON e.cliente_id = c.id
      INNER JOIN tipo_barco tb ON e.tipo_barco_id = tb.id
    `

    const params = []

    if (estado) {
      sql += ` WHERE s.estado = ?`
      params.push(estado.toUpperCase())
    }

    sql += ` ORDER BY s.fecha_solicitud DESC, s.id DESC`

    const [solicitudes] = await pool.query(sql, params)

    res.json({
      ok: true,
      total: solicitudes.length,
      solicitudes
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Error al obtener solicitudes',
      detalle: error.message
    })
  }
})

/* ======================================
   OBTENER SOLICITUD POR ID
====================================== */

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const [solicitudes] = await pool.query(
      `
      SELECT
        s.id,
        s.fecha_solicitud,
        s.fecha_llegada,
        s.fecha_salida,
        s.estado,
        s.comentario,
        s.primera_entrada_mexico,
        s.motivo_rechazo,

        e.id AS embarcacion_id,
        e.nombre_bote,
        e.eslora,
        e.manga,
        e.calado,

        c.id AS cliente_id,
        c.fullname,
        c.email,
        c.telefono,

        tb.id AS tipo_barco_id,
        tb.tipo_barco
      FROM solicitud s
      INNER JOIN embarcacion e ON s.embarcacion_id = e.id
      INNER JOIN clientes c ON e.cliente_id = c.id
      INNER JOIN tipo_barco tb ON e.tipo_barco_id = tb.id
      WHERE s.id = ?
      LIMIT 1
      `,
      [id]
    )

    if (solicitudes.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Solicitud no encontrada'
      })
    }

    const [historial] = await pool.query(
      `
      SELECT
        id,
        estado_anterior,
        estado_nuevo,
        fecha_cambio
      FROM solicitud_historial
      WHERE solicitud_id = ?
      ORDER BY fecha_cambio DESC
      `,
      [id]
    )

    res.json({
      ok: true,
      solicitud: {
        ...solicitudes[0],
        historial
      }
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Error al obtener la solicitud',
      detalle: error.message
    })
  }
})

/* ======================================
   CREAR SOLICITUD
====================================== */

router.post('/', async (req, res) => {
  const connection = await pool.getConnection()

  try {
    const {
      fullname,
      telefono,
      email,
      nombre_bote,
      tipo_barco,
      tipo_barco_id,
      eslora,
      manga,
      calado,
      fecha_llegada,
      fecha_salida,
      primera_entrada_mexico,
      comentario
    } = req.body

    if (
      !fullname ||
      !telefono ||
      !email ||
      !nombre_bote ||
      (!tipo_barco && !tipo_barco_id) ||
      !eslora ||
      !manga ||
      !calado ||
      !fecha_llegada ||
      !fecha_salida
    ) {
      return res.status(400).json({
        ok: false,
        error: 'Todos los campos obligatorios son requeridos'
      })
    }

    if (fecha_salida <= fecha_llegada) {
      return res.status(400).json({
        ok: false,
        error: 'La fecha de salida debe ser posterior a la fecha de llegada'
      })
    }

    await connection.beginTransaction()

    let clienteId
    let tipoBarcoId

    const [clienteExistente] = await connection.query(
      `
      SELECT id
      FROM clientes
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    )

    if (clienteExistente.length > 0) {
      clienteId = clienteExistente[0].id

      await connection.query(
        `
        UPDATE clientes
        SET fullname = ?, telefono = ?
        WHERE id = ?
        `,
        [fullname, telefono, clienteId]
      )
    } else {
      const [clienteResult] = await connection.query(
        `
        INSERT INTO clientes (fullname, email, telefono)
        VALUES (?, ?, ?)
        `,
        [fullname, email, telefono]
      )

      clienteId = clienteResult.insertId
    }

    if (tipo_barco_id) {
      tipoBarcoId = tipo_barco_id
    } else {
      const [tipoExistente] = await connection.query(
        `
        SELECT id
        FROM tipo_barco
        WHERE tipo_barco = UPPER(?)
        LIMIT 1
        `,
        [tipo_barco]
      )

      if (tipoExistente.length > 0) {
        tipoBarcoId = tipoExistente[0].id
      } else {
        const [tipoResult] = await connection.query(
          `
          INSERT INTO tipo_barco (tipo_barco)
          VALUES (?)
          `,
          [tipo_barco]
        )

        tipoBarcoId = tipoResult.insertId
      }
    }

    const [embarcacionResult] = await connection.query(
      `
      INSERT INTO embarcacion (
        cliente_id,
        tipo_barco_id,
        nombre_bote,
        eslora,
        manga,
        calado
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        clienteId,
        tipoBarcoId,
        nombre_bote,
        Number(eslora),
        Number(manga),
        Number(calado)
      ]
    )

    const embarcacionId = embarcacionResult.insertId

    const [solicitudResult] = await connection.query(
      `
      INSERT INTO solicitud (
        embarcacion_id,
        fecha_llegada,
        fecha_salida,
        comentario,
        primera_entrada_mexico
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        embarcacionId,
        fecha_llegada,
        fecha_salida,
        comentario || null,
        primera_entrada_mexico ? 1 : 0
      ]
    )

    await connection.commit()

    res.status(201).json({
      ok: true,
      message: 'Solicitud creada correctamente',
      solicitud_id: solicitudResult.insertId
    })
  } catch (error) {
    await connection.rollback()

    res.status(500).json({
      ok: false,
      error: 'Error al crear solicitud',
      detalle: error.message
    })
  } finally {
    connection.release()
  }
})

/* ======================================
   ACTUALIZAR ESTADO
====================================== */

router.patch('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params
    const { estado, motivo } = req.body

    const nuevoEstado = estado?.toUpperCase()

    if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
      return res.status(400).json({
        ok: false,
        error: 'Estado no válido'
      })
    }

    if (nuevoEstado === 'RECHAZADA' && !motivo) {
      return res.status(400).json({
        ok: false,
        error: 'Debe indicar el motivo de rechazo'
      })
    }

    const [solicitudActual] = await pool.query(
      `
      SELECT id, estado
      FROM solicitud
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    )

    if (solicitudActual.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Solicitud no encontrada'
      })
    }

    await pool.query(
      `
      UPDATE solicitud
      SET estado = ?,
          motivo_rechazo = ?
      WHERE id = ?
      `,
      [
        nuevoEstado,
        nuevoEstado === 'RECHAZADA' ? motivo : null,
        id
      ]
    )

    res.json({
      ok: true,
      message: 'Estado actualizado correctamente'
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Error al actualizar estado',
      detalle: error.message
    })
  }
})

/* ======================================
   ELIMINAR SOLICITUD
====================================== */

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const [result] = await pool.query(
      `
      DELETE FROM solicitud
      WHERE id = ?
      `,
      [id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Solicitud no encontrada'
      })
    }

    res.json({
      ok: true,
      message: 'Solicitud eliminada correctamente'
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Error al eliminar solicitud',
      detalle: error.message
    })
  }
})

export default router