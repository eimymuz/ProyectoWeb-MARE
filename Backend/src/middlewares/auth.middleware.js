import jwt from 'jsonwebtoken'

// Middleware que verifica el token JWT en cada petición protegida.
// Extrae el token del header Authorization y lo valida con la llave secreta.
// Si es válido, agrega los datos del admin a req.admin y continúa.
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: 'Token requerido'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.admin = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      ok: false,
      error: 'Token inválido o expirado'
    })
  }
}

export default authMiddleware