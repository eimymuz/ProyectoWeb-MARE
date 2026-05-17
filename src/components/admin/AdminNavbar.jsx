import { NavLink, useNavigate } from 'react-router-dom'
import { obtenerAdmin, eliminarToken } from '../../services/api'
import { Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  Clock3,
  Map,
  Check,
  ClipboardList,
  LogOut,
} from 'lucide-react'

// Barra de navegación del panel administrativo.
// Muestra las secciones disponibles según el rol del admin logueado
// y permite cerrar sesión eliminando el token de localStorage.
// Permite cambiar entre las secciones de solicitudes y el mapa.
function AdminNavbar() {

  const navigate = useNavigate()

  // Recupera los datos del admin guardados al hacer login
  const admin = obtenerAdmin()

  //verifica si el admin tiene rol de gerente para mostrar la sección de usuarios
  const esGerente = admin?.rol === 'gerente'

  // Toma las iniciales del nombre para mostrar en el avatar
  const iniciales = admin?.fullname
    ? admin.fullname.split(' ').slice(0, 2).map(n => n[0]).join('')
    : 'AD'

  const cerrarSesion = () => {
    eliminarToken()
    navigate('/login')
  }
  
  return (
    <header className="admin-header">

      <div className="admin-header-inner">

        {/* LOGO */}
        <Link to="/admin" className="admin-logo">
          MARE
        </Link>

        {/* NAV */}
        <nav className="admin-nav">

          <NavLink to="/admin/pendientes" className="admin-link">
            <ClipboardList size={16} />
            Pendientes
          </NavLink>

          <NavLink to="/admin/esperando" className="admin-link">
            <Clock3 size={16} />
            Esperando
          </NavLink>

          <NavLink to="/admin/asignadas" className="admin-link">
            <Check size={16} />
            Asignadas
          </NavLink>

          <NavLink to="/admin/mapa" className="admin-link">
            <Map size={16} />
            Mapa
          </NavLink>



        </nav>

        {/* USER */}
        <div className="admin-user">

          {esGerente && (
            <NavLink to="/admin/usuarios" className="admin-link">
              <Users size={16} />
              Usuarios
            </NavLink>
          )}

            {/* Nombre y rol del admin logueado */}
            <div className="admin-user-info">
              <span className="admin-user-name">{admin?.fullname}</span>
              <span className="admin-user-rol">{admin?.rol}</span>
            </div>

            {/* Avatar con iniciales */}
            <div className="admin-avatar">
              {iniciales}
            </div>

            {/* Botón cerrar sesión */}
            <button
              type="button"
              className="admin-logout"
              onClick={cerrarSesion}
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>

        </div>

      </div>

    </header>
  )
}

export default AdminNavbar