import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import ClientLayout from '../layouts/ClientLayout'
import AdminLayout from '../layouts/AdminLayout'

import AdminPendientes from '../pages/admin/AdminPendientes'
import AdminEsperando from '../pages/admin/AdminEsperando'
import AdminAsignadas from '../pages/admin/AdminAsignadas'
import AdminMapa from '../pages/admin/AdminMapa'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientLayout />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/pendientes" replace />} />
          <Route path="pendientes" element={<AdminPendientes />} />
          <Route path="esperando" element={<AdminEsperando />} />
          <Route path="asignadas" element={<AdminAsignadas />} />
          <Route path="mapa" element={<AdminMapa />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes