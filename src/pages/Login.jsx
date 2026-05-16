import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import API_URL, {
  guardarToken,
  guardarAdmin
} from '../services/api'

import './Login.css'

// Página de inicio de sesión del panel administrativo.
// Valida credenciales contra el backend y guarda el token JWT
// en localStorage para mantener la sesión activa.
function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    // Validación básica antes de llamar al backend
    if (!username.trim() || !password.trim()) {
      setError('Ingresa tu usuario y contraseña')
      return
    }

    try {
      setCargando(true)

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!data.ok) {
        setError(data.error || 'Credenciales incorrectas')
        return
      }

      // Guarda el token y los datos del admin en localStorage
      guardarToken(data.token)
      guardarAdmin(data.admin)

      // Redirige al panel admin
      navigate('/admin/pendientes')
    } catch (err) {
      setError('No se pudo conectar con el servidor')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="login-page">

      <div className="login-card">

        {/* ENCABEZADO */}
        <div className="login-header">
          <h1 className="login-logo">MARE</h1>
          <p className="login-sub">Marina Puerto de la Navidad</p>
          <p className="login-desc">Panel administrativo</p>
        </div>

        {/* FORMULARIO */}
        <form className="login-form" onSubmit={handleLogin}>

          <div className="login-field">
            <label>Usuario</label>
            <input
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="login-field">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {/* Muestra el error si las credenciales son incorrectas */}
          {error && (
            <p className="login-error">{error}</p>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={cargando}
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

        </form>

      </div>

    </div>
  )
}

export default Login