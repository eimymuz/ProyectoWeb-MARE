import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../../config/db.js'

const router = Router()

/* ======================================
   LOGIN
   POST /api/auth/login
====================================== */

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {}

    if (!username || !password) {
      return res.status(400).json({
        ok: false,
        error: 'Usuario y contraseña requeridos'
      })
    }

    const [admins] = await pool.query(
      `SELECT id, fullname, email, username, password, rol, activo
       FROM administrador
       WHERE username = ?
       LIMIT 1`,
      [username]
    )

    if (admins.length === 0) {
      return res.status(401).json({
        ok: false,
        error: 'Credenciales incorrectas'
      })
    }

    const admin = admins[0]

    if (admin.activo !== 1) {
      return res.status(401).json({
        ok: false,
        error: 'Usuario inactivo'
      })
    }

    const passwordValida = await bcrypt.compare(password, admin.password)

    if (!passwordValida) {
      return res.status(401).json({
        ok: false,
        error: 'Credenciales incorrectas'
      })
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        fullname: admin.fullname,
        rol: admin.rol
      },
      process.env.JWT_SECRET || 'mare_secret',
      { expiresIn: '8h' }
    )

    res.json({
      ok: true,
      token,
      admin: {
        id: admin.id,
        fullname: admin.fullname,
        email: admin.email,
        username: admin.username,
        rol: admin.rol
      }
    })
  } catch (error) {
    console.error('ERROR LOGIN:', error)

    res.status(500).json({
      ok: false,
      error: 'Error al iniciar sesión',
      detalle: error.message
    })
  }
})

export default router