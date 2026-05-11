import { NavLink } from 'react-router-dom'

import {
  Clock3,
  Map,
  Check,
  ClipboardList
} from 'lucide-react'

// Barra de navegación del panel administrativo.
// Permite cambiar entre las secciones de solicitudes y el mapa.
function AdminNavbar() {
  return (
    <header className="admin-header">

      <div className="admin-header-inner">

        {/* LOGO */}
        <div className="admin-logo">
          MARE
        </div>

        {/* NAV */}
        <nav className="admin-nav">

          <NavLink
            to="/admin/pendientes"
            className="admin-link"
          >
            <ClipboardList size={16} />
            Pendientes
          </NavLink>

          <NavLink
            to="/admin/esperando"
            className="admin-link"
          >
            <Clock3 size={16} />
            Esperando
          </NavLink>

          <NavLink
            to="/admin/asignadas"
            className="admin-link"
          >
            <Check size={16} />
            Asignadas
          </NavLink>

          <NavLink
            to="/admin/mapa"
            className="admin-link"
          >
            <Map size={16} />
            Mapa
          </NavLink>

        </nav>

        {/* USER */}
        <div className="admin-user">

          <div className="admin-status">
            <span className="status-dot"></span>
            Sistema activo
          </div>

          <div className="admin-avatar">
            AD
          </div>

        </div>

      </div>

    </header>
  )
}

export default AdminNavbar