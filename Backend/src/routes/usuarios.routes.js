import { Router } from 'express'
import bcrypt from 'bcryptjs'
import pool from '../../config/db.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = Router()

const ROLES_VALIDOS = ['gerente', 'empleado', 'inactivo']

/* ======================================
   LISTAR USUARIOS
   GET /api/usuarios
====================================== */

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      `SELECT id, fullname, email, username, rol, activo
       FROM administrador
       ORDER BY fullname ASC`
    )

    res.json({ ok: true, usuarios })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Error al obtener usuarios',
      detalle: error.message
    })
  }
})

/* ======================================
   CREAR USUARIO
   POST /api/usuarios
   Solo gerentes
====================================== */

router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.admin.rol !== 'gerente') {
      return res.status(403).json({
        ok: false,
        error: 'Sin permisos para crear usuarios'
      })
    }

    const { fullname, email, username, password, rol } = req.body

    if (!fullname || !email || !username || !password || !rol) {
      return res.status(400).json({
        ok: false,
        error: 'Todos los campos son requeridos'
      })
    }

    if (!ROLES_VALIDOS.includes(rol)) {
      return res.status(400).json({
        ok: false,
        error: 'Rol no válido'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await pool.query(
      `INSERT INTO administrador (fullname, email, username, password, rol)
       VALUES (UPPER(?), LOWER(?), UPPER(?), ?, ?)`,
      [fullname, email, username, hashedPassword, rol]
    )

    res.status(201).json({
      ok: true,
      message: 'Usuario creado correctamente',
      id: result.insertId
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        ok: false,
        error: 'El email o username ya está en uso'
      })
    }

    res.status(500).json({
      ok: false,
      error: 'Error al crear usuario',
      detalle: error.message
    })
  }
})

/* ======================================
   EDITAR USUARIO
   PUT /api/usuarios/:id
   Solo gerentes
====================================== */

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.admin.rol !== 'gerente') {
      return res.status(403).json({
        ok: false,
        error: 'Sin permisos para editar usuarios'
      })
    }

    const { id } = req.params
    const { fullname, email, username, rol, password } = req.body

    if (!fullname || !email || !username || !rol) {
      return res.status(400).json({
        ok: false,
        error: 'Todos los campos son requeridos'
      })
    }

    if (!ROLES_VALIDOS.includes(rol)) {
      return res.status(400).json({
        ok: false,
        error: 'Rol no válido'
      })
    }

    let sql, params

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      sql = `UPDATE administrador
             SET fullname = UPPER(?), email = LOWER(?), username = UPPER(?), rol = ?, password = ?
             WHERE id = ?`
      params = [fullname, email, username, rol, hashedPassword, id]
    } else {
      sql = `UPDATE administrador
             SET fullname = UPPER(?), email = LOWER(?), username = UPPER(?), rol = ?
             WHERE id = ?`
      params = [fullname, email, username, rol, id]
    }

    const [result] = await pool.query(sql, params)

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Usuario no encontrado'
      })
    }

    res.json({ ok: true, message: 'Usuario actualizado correctamente' })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        ok: false,
        error: 'El email o username ya está en uso'
      })
    }

    res.status(500).json({
      ok: false,
      error: 'Error al editar usuario',
      detalle: error.message
    })
  }
})

/* ======================================
   DESACTIVAR USUARIO
   PATCH /api/usuarios/:id/desactivar
====================================== */

router.patch('/:id/desactivar', authMiddleware, async (req, res) => {
  try {
    if (req.admin.rol !== 'gerente') {
      return res.status(403).json({
        ok: false,
        error: 'Sin permisos para desactivar usuarios'
      })
    }

    const { id } = req.params

    if (Number(id) === req.admin.id) {
      return res.status(400).json({
        ok: false,
        error: 'No puedes desactivarte a ti mismo'
      })
    }

    await pool.query(
      `UPDATE administrador SET activo = FALSE WHERE id = ?`,
      [id]
    )

    res.json({ ok: true, message: 'Usuario desactivado' })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Error al desactivar usuario',
      detalle: error.message
    })
  }
})

/* ======================================
   REACTIVAR USUARIO
   PATCH /api/usuarios/:id/reactivar
====================================== */

router.patch('/:id/reactivar', authMiddleware, async (req, res) => {
  try {
    if (req.admin.rol !== 'gerente') {
      return res.status(403).json({
        ok: false,
        error: 'Sin permisos para reactivar usuarios'
      })
    }

    const { id } = req.params

    await pool.query(
      `UPDATE administrador SET activo = TRUE WHERE id = ?`,
      [id]
    )

    res.json({ ok: true, message: 'Usuario reactivado' })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Error al reactivar usuario',
      detalle: error.message
    })
  }
})

export default router