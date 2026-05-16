import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import PrivateRoute from './PrivateRoute'

import ClientLayout from '../layouts/ClientLayout'
import AdminLayout from '../layouts/AdminLayout'

import Login from '../pages/Login'

import AdminUsuarios from '../pages/admin/AdminUsuarios'
import AdminPendientes from '../pages/admin/AdminPendientes'
import AdminEditarSolicitud from '../pages/admin/AdminEditarSolicitud'
import AdminEsperando from '../pages/admin/AdminEsperando'
import AdminAsignadas from '../pages/admin/AdminAsignadas'
import AdminMapa from '../pages/admin/AdminMapa'

// Definición de las rutas de la aplicación.
// La ruta pública '/' usa ClientLayout, y '/admin' usa el layout administrativo.
// Las rutas de /admin están protegidas con PrivateRoute —
// si no hay sesión activa, redirigen automáticamente al login.
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* RUTA PÚBLICA — formulario de reserva para clientes */}
        <Route path="/" element={<ClientLayout />} />

        {/* LOGIN — página de inicio de sesión */}
        <Route path="/login" element={<Login />} />

        {/* PANEL ADMIN — protegido, requiere sesión activa */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          {/* Redirige /admin directo a pendientes */}
          <Route index element={<Navigate to="pendientes" replace />} />

          <Route path="pendientes" element={<AdminPendientes />} />
          <Route path="editar/:id" element={<AdminEditarSolicitud />} />
          <Route path="esperando" element={<AdminEsperando />} />
          <Route path="asignadas" element={<AdminAsignadas />} />
          <Route path="mapa" element={<AdminMapa />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes