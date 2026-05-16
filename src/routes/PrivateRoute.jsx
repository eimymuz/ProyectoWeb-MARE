import { Navigate } from 'react-router-dom'
import { haySesion } from '../services/api'

// Componente que protege las rutas del panel admin.
// Si el usuario no tiene sesión activa, lo redirige al login.
// Si sí tiene sesión, renderiza la página solicitada.
function PrivateRoute({ children }) {
  if (!haySesion()) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute