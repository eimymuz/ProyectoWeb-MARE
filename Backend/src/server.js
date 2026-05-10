import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import solicitudesRoutes from './routes/solicitudes.routes.js'

dotenv.config()

const app = express()

/* ======================================
   MIDDLEWARES
====================================== */

app.use(cors())

app.use(express.json())

/* ======================================
   RUTA PRINCIPAL
====================================== */

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Backend MARE funcionando'
  })
})

/* ======================================
   API
====================================== */

app.use('/api/solicitudes', solicitudesRoutes)

/* ======================================
   SERVIDOR
====================================== */

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`)
})