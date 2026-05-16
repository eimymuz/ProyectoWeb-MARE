// URL base del backend que consume el frontend.
// Cambiar a la dirección del servidor en producción si es necesario.
// se debrai cambiar en producción
const API_URL = 'http://localhost:3000/api'

// ── TOKEN ──────────────────────────────────────────
// Guarda el token JWT en localStorage al hacer login.
export const guardarToken = (token) => {
  localStorage.setItem('mare_token', token)
}

// Recupera el token guardado. Retorna null si no hay sesión.
export const obtenerToken = () => {
  return localStorage.getItem('mare_token')
}

// Elimina el token al cerrar sesión.
export const eliminarToken = () => {
  localStorage.removeItem('mare_token')
  localStorage.removeItem('mare_admin')
}

// ── ADMIN ───────────────────────────────────────────
// Guarda los datos del admin logueado (nombre, rol, etc).
export const guardarAdmin = (admin) => {
  localStorage.setItem('mare_admin', JSON.stringify(admin))
}

// Recupera los datos del admin. Retorna null si no hay sesión.
export const obtenerAdmin = () => {
  const data = localStorage.getItem('mare_admin')
  return data ? JSON.parse(data) : null
}

// ── SESIÓN ──────────────────────────────────────────
// Verifica si hay una sesión activa (token presente).
export const haySesion = () => {
  return !!localStorage.getItem('mare_token')
}

// ── FETCH CON AUTH ──────────────────────────────────
// Realiza peticiones al backend incluyendo el token JWT
// en el header Authorization automáticamente.
export const fetchAuth = async (endpoint, opciones = {}) => {
  const token = obtenerToken()

  const respuesta = await fetch(`${API_URL}${endpoint}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...opciones.headers
    }
  })

  return respuesta
}

export default API_URL