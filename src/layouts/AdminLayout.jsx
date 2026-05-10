import { NavLink, Outlet } from 'react-router-dom'
import { ClipboardList, Clock, Check, Map } from 'lucide-react'
import '../styles/admin.css'

function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h1>MARE</h1>

        <nav>
          <NavLink to="/admin/pendientes">
            <ClipboardList size={18} />
            Pendientes
          </NavLink>

          <NavLink to="/admin/esperando">
            <Clock size={18} />
            Esperando
          </NavLink>

          <NavLink to="/admin/asignadas">
            <Check size={18} />
            Asignadas
          </NavLink>

          <NavLink to="/admin/mapa">
            <Map size={18} />
            Mapa
          </NavLink>
        </nav>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout