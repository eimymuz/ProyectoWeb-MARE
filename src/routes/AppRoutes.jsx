import { BrowserRouter, Routes, Route } from 'react-router-dom'

import ClientLayout from '../layouts/ClientLayout'
import AdminLayout from '../layouts/AdminLayout'

import AdminPendientes from '../pages/admin/AdminPendientes'
import AdminEditarSolicitud from '../pages/admin/AdminEditarSolicitud'
import AdminEsperando from '../pages/admin/AdminEsperando'
import AdminAsignadas from '../pages/admin/AdminAsignadas'
import AdminMapa from '../pages/admin/AdminMapa'

// Definición de las rutas de la aplicación.
// La ruta pública '/' usa ClientLayout, y '/admin' usa el layout administrativo.
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientLayout />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="pendientes" element={<AdminPendientes />} />
          <Route
            path="pendientes/editar/:id"
            element={<AdminEditarSolicitud />}
          />
          <Route path="esperando" element={<AdminEsperando />} />
          <Route path="asignadas" element={<AdminAsignadas />} />
          <Route path="mapa" element={<AdminMapa />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes