import { Router } from 'express'
import { solicitudes } from '../data/solicitudes.js'

const router = Router()

router.get('/', (req, res) => {
  res.json({
    ok: true,
    total: solicitudes.length,
    solicitudes
  })
})

router.post('/', (req, res) => {

  const {
    fullname,
    telefono,
    email,
    nombre_bote,
    tipo_barco,
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
    !tipo_barco
  ) {
    return res.status(400).json({
      ok: false,
      error: 'Campos obligatorios faltantes'
    })
  }

  const nuevaSolicitud = {
    id: solicitudes.length + 1,

    fullname,
    telefono,
    email,

    nombre_bote,
    tipo_barco,

    eslora,
    manga,
    calado,

    fecha_llegada,
    fecha_salida,

    primera_entrada_mexico,

    comentario,

    estado: 'PENDIENTE',

    fecha_solicitud: new Date()
  }

  solicitudes.push(nuevaSolicitud)

  res.status(201).json({
    ok: true,
    solicitud: nuevaSolicitud
  })

})

export default router