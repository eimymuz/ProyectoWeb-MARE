import { Outlet } from 'react-router-dom'

import AdminNavbar from '../components/admin/AdminNavbar'
import AdminFooter from '../components/admin/AdminFooter'

import '../styles/admin-layout.css'

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