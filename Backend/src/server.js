import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'


import authRoutes from './routes/auth.routes.js'
import usuariosRoutes from './routes/usuarios.routes.js'
import solicitudesRoutes from './routes/solicitudes.routes.js'

dotenv.config()

const app = express()

// Servidor Express principal del backend.
// Configura CORS, parseo JSON y monta las rutas de solicitudes.
/* ======================================
   MIDDLEWARES GLOBALES
   - cors: permiten peticiones desde el frontend React
   - express.json: parsea el body de las peticiones como JSON
====================================== */

app.use(cors())

app.use(express.json())



/* ======================================
   RUTA PRINCIPAL
   Verifica que el servidor esté activo
====================================== */

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Backend MARE funcionando'
  })
})

/* ======================================
   API
   Todas las rutas del sistema bajo /api
   - /api/auth       → login y autenticación
   - /api/usuarios   → CRUD de administradores (requiere JWT)
   - /api/solicitudes → gestión de solicitudes de la marina
====================================== */

app.use('/api/auth', authRoutes)

app.use('/api/usuarios', usuariosRoutes)

app.use('/api/solicitudes', solicitudesRoutes)

/* ======================================
   SERVIDOR
      Escucha en el puerto definido en .env
      o en el 3000 por defecto
====================================== */

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`)
})