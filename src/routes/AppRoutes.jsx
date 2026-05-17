import { BrowserRouter, Routes, Route } from 'react-router-dom'

import PrivateRoute from './PrivateRoute'

import ClientLayout from '../layouts/ClientLayout'
import AdminLayout from '../layouts/AdminLayout'

import Login from '../pages/Login'

import AdminInicio from '../pages/admin/AdminInicio'

import AdminUsuarios from '../pages/admin/AdminUsuarios'
import AdminPendientes from '../pages/admin/AdminPendientes'
import AdminEditarSolicitud from '../pages/admin/AdminEditarSolicitud'
import AdminEsperando from '../pages/admin/AdminEsperando'
import AdminAsignadas from '../pages/admin/AdminAsignadas'
import AdminMapa from '../pages/admin/AdminMapa'
import AdminReportes from '../pages/admin/AdminReportes'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PÁGINA PÚBLICA */}
        <Route
          path="/"
          element={<ClientLayout />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* PANEL ADMIN */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >

          {/* INICIO */}
          <Route
            index
            element={<AdminInicio />}
          />

          {/* PENDIENTES */}
          <Route
            path="pendientes"
            element={<AdminPendientes />}
          />

          {/* EDITAR */}
          <Route
            path="editar/:id"
            element={<AdminEditarSolicitud />}
          />

          {/* ESPERANDO */}
          <Route
            path="esperando"
            element={<AdminEsperando />}
          />

          {/* ASIGNADAS */}
          <Route
            path="asignadas"
            element={<AdminAsignadas />}
          />

          {/* MAPA */}
          <Route
            path="mapa"
            element={<AdminMapa />}
          />

          {/* REPORTES */}
          <Route
            path="reportes"
            element={<AdminReportes />}
          />

          {/* USUARIOS */}
          <Route
            path="usuarios"
            element={<AdminUsuarios />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes