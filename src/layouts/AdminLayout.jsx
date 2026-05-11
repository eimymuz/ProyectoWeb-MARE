import { Outlet } from 'react-router-dom'

import AdminNavbar from '../components/admin/AdminNavbar'
import AdminFooter from '../components/admin/AdminFooter'

import '../styles/admin-layout.css'

// Layout general para la sección administrativa.
// Contiene la navegación superior, el contenido interno y el pie de página.
function AdminLayout() {
  return (
    <div className="admin-shell">

      <AdminNavbar />

      <main className="admin-main">
        <Outlet />
      </main>

      <AdminFooter />

    </div>
  )
}

export default AdminLayout