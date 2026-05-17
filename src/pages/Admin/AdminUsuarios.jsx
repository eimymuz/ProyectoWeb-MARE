import { useEffect, useState } from 'react'
import { fetchAuth, obtenerAdmin } from '../../services/api'
import './styles/AdminUsuarios.css'

// Página de gestión de administradores del sistema.
// Solo los gerentes pueden crear, editar, desactivar y reactivar usuarios.
// Los empleados solo pueden ver la lista.
function AdminUsuarios() {
  const adminActual = obtenerAdmin()
  const esGerente = adminActual?.rol === 'gerente'

  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)

  // Estado del modal — null = cerrado, 'crear' o 'editar' = abierto
  const [modal, setModal] = useState(null)
  const [usuarioEditar, setUsuarioEditar] = useState(null)
 // Filtro por rol — vacío muestra todos
  const [filtroRol, setFiltroRol] = useState('')
  // Campos del formulario
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    username: '',
    password: '',
    rol: 'empleado'
  })
  

  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    obtenerUsuarios()
  }, [])

  // Obtiene la lista de todos los administradores del backend
  const obtenerUsuarios = async () => {
    try {
      setLoading(true)

      const res = await fetchAuth('/usuarios')
      const data = await res.json()

      if (data.ok) {
        setUsuarios(data.usuarios)
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  // Abre el modal vacío para crear un nuevo usuario
  const abrirModalCrear = () => {
    setForm({
      fullname: '',
      email: '',
      username: '',
      password: '',
      rol: 'empleado'
    })
    setError('')
    setModal('crear')
  }

  // Abre el modal prellenado con los datos del usuario a editar
  const abrirModalEditar = (usuario) => {
    setUsuarioEditar(usuario)
    setForm({
      fullname: usuario.fullname,
      email: usuario.email,
      username: usuario.username,
      password: '',
      rol: usuario.rol
    })
    setError('')
    setModal('editar')
  }

  const cerrarModal = () => {
    setModal(null)
    setUsuarioEditar(null)
    setError('')
  }

  // Actualiza el estado del formulario cuando el usuario escribe
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Envía el formulario — crea o edita según el modo del modal
  const handleGuardar = async (e) => {
    e.preventDefault()
    setError('')

    // Validaciones de campos
    if (!form.fullname.trim()) {
      setError('El nombre completo es obligatorio')
      return
    }

    if (form.fullname.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres')
      return
    }

    if (!form.email.trim()) {
      setError('El correo es obligatorio')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('El correo no tiene un formato válido')
      return
    }

    if (!form.username.trim()) {
      setError('El usuario es obligatorio')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(form.username.trim())) {
      setError('El usuario solo puede contener letras, números y guión bajo')
      return
    }

    if (form.username.trim().length < 3) {
      setError('El usuario debe tener al menos 3 caracteres')
      return
    }

    if (!form.rol) {
      setError('El rol es obligatorio')
      return
    }

    if (modal === 'crear' && !form.password) {
      setError('La contraseña es obligatoria al crear un usuario')
      return
    }

    if (modal === 'crear' && form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (modal === 'editar' && form.password && form.password.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      setGuardando(true)

      const endpoint = modal === 'crear'
        ? '/usuarios'
        : `/usuarios/${usuarioEditar.id}`

      const metodo = modal === 'crear' ? 'POST' : 'PUT'

      const res = await fetchAuth(endpoint, {
        method: metodo,
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!data.ok) {
        setError(data.error || 'Error al guardar el usuario')
        return
      }

      cerrarModal()
      obtenerUsuarios()
    } catch (err) {
      setError('Error de conexión con el servidor')
    } finally {
      setGuardando(false)
    }
  }

  // Desactiva un usuario sin eliminarlo — preserva historial de asignaciones
  const desactivarUsuario = async (id) => {
    if (!confirm('¿Desactivar este usuario?')) return

    try {
      const res = await fetchAuth(`/usuarios/${id}/desactivar`, {
        method: 'PATCH'
      })

      const data = await res.json()

      if (!data.ok) {
        alert(data.error || 'No se pudo desactivar el usuario')
        return
      }

      obtenerUsuarios()
    } catch (err) {
      alert('Error de conexión')
    }
  }

  // Reactiva un usuario previamente desactivado
  const reactivarUsuario = async (id) => {
    try {
      const res = await fetchAuth(`/usuarios/${id}/reactivar`, {
        method: 'PATCH'
      })

      const data = await res.json()

      if (!data.ok) {
        alert(data.error || 'No se pudo reactivar el usuario')
        return
      }

      obtenerUsuarios()
    } catch (err) {
      alert('Error de conexión')
    }
  }

  // Filtra la lista según el rol seleccionado
    const usuariosFiltrados = usuarios.filter((u) => {
    if (!filtroRol) return true
    if (filtroRol === 'inactivo') return !u.activo
    return u.rol === filtroRol && u.activo
    })

        return (
        <div className="admin-usuarios-page">

            {/* ENCABEZADO */}
            <div className="admin-usuarios-header">
            <h2>Gestión de usuarios</h2>

            {esGerente && (
                <button
                type="button"
                className="btn-nuevo-usuario"
                onClick={abrirModalCrear}
                >
                + Nuevo usuario
                </button>
            )}
            </div>

            {/* FILTROS — entre el header y la tabla */}
            <div className="admin-usuarios-filtros">
            <button
                type="button"
                className={`filtro-btn ${filtroRol === '' ? 'active' : ''}`}
                onClick={() => setFiltroRol('')}
            >
                Todos
            </button>

            <button
                type="button"
                className={`filtro-btn ${filtroRol === 'gerente' ? 'active' : ''}`}
                onClick={() => setFiltroRol('gerente')}
            >
                Gerentes
            </button>

            <button
                type="button"
                className={`filtro-btn ${filtroRol === 'empleado' ? 'active' : ''}`}
                onClick={() => setFiltroRol('empleado')}
            >
                Empleados
            </button>

            <button
                type="button"
                className={`filtro-btn ${filtroRol === 'inactivo' ? 'active' : ''}`}
                onClick={() => setFiltroRol('inactivo')}
            >
                Inactivos
            </button>
            </div>

            {/* TABLA */}
            <div className="admin-usuarios-table">
            <table>
                <thead>
                <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    {esGerente && <th>Acciones</th>}
                </tr>
                </thead>

                <tbody>
                {loading ? (
                    <tr>
                    <td colSpan={esGerente ? 7 : 6} className="admin-usuarios-empty">
                        Cargando usuarios...
                    </td>
                    </tr>
                ) : usuariosFiltrados.length === 0 ? (
                    <tr>
                    <td colSpan={esGerente ? 7 : 6} className="admin-usuarios-empty">
                        No hay usuarios en este filtro.
                    </td>
                    </tr>
                ) : (
                    usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id} className={!usuario.activo ? 'usuario-inactivo' : ''}>
                        <td className="usuario-id">#{usuario.id}</td>
                        <td>{usuario.fullname}</td>
                        <td>{usuario.email}</td>
                        <td>{usuario.username}</td>

                        <td>
                        <span className={`rol-badge rol-${usuario.rol}`}>
                            {usuario.rol}
                        </span>
                        </td>

                        <td>
                        <span className={`estado-badge ${usuario.activo ? 'activo' : 'inactivo'}`}>
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                        </td>

                        {esGerente && (
                        <td>
                            <div className="usuario-actions">
                            <button
                                type="button"
                                className="btn-editar"
                                onClick={() => abrirModalEditar(usuario)}
                            >
                                Editar
                            </button>

                            {usuario.activo ? (
                                <button
                                type="button"
                                className="btn-desactivar"
                                onClick={() => desactivarUsuario(usuario.id)}
                                disabled={usuario.id === adminActual?.id}
                                >
                                Desactivar
                                </button>
                            ) : (
                                <button
                                type="button"
                                className="btn-reactivar"
                                onClick={() => reactivarUsuario(usuario.id)}
                                >
                                Reactivar
                                </button>
                            )}
                            </div>
                        </td>
                        )}
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>

            {/* MODAL CREAR / EDITAR */}
            {modal && (
            <div
                className="usuarios-modal-overlay"
                onClick={cerrarModal}
            >
                <div
                className="usuarios-modal"
                onClick={(e) => e.stopPropagation()}
                >
                <div className="usuarios-modal-header">
                    <h3>
                    {modal === 'crear' ? 'Nuevo usuario' : 'Editar usuario'}
                    </h3>

                    <button
                    type="button"
                    className="modal-close"
                    onClick={cerrarModal}
                    >
                    ×
                    </button>
                </div>

                <form className="usuarios-form" onSubmit={handleGuardar}>

                    <div className="form-row">
                    <div className="form-field">
                        <label>Nombre completo</label>
                        <input
                        name="fullname"
                        placeholder="Nombre del administrador"
                        value={form.fullname}
                        onChange={handleChange}
                        />
                    </div>

                    <div className="form-field">
                        <label>Email</label>
                        <input
                        name="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={form.email}
                        onChange={handleChange}
                        />
                    </div>
                    </div>

                    <div className="form-row">
                    <div className="form-field">
                        <label>Usuario</label>
                        <input
                        name="username"
                        placeholder="Nombre de usuario"
                        value={form.username}
                        onChange={handleChange}
                        />
                    </div>

                    <div className="form-field">
                        <label>
                        Contraseña
                        {modal === 'editar' && (
                            <span className="label-hint"> (dejar vacío para no cambiar)</span>
                        )}
                        </label>
                        <input
                        name="password"
                        type="password"
                        placeholder={modal === 'crear' ? 'Contraseña' : 'Nueva contraseña (opcional)'}
                        value={form.password}
                        onChange={handleChange}
                        />
                    </div>
                    </div>

                    <div className="form-field">
                    <label>Rol</label>
                    <select
                        name="rol"
                        value={form.rol}
                        onChange={handleChange}
                    >
                        <option value="empleado">Empleado</option>
                        <option value="gerente">Gerente</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                    </div>

                    {error && (
                    <p className="form-error">{error}</p>
                    )}

                    <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancelar"
                        onClick={cerrarModal}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="btn-guardar"
                        disabled={guardando}
                    >
                        {guardando ? 'Guardando...' : 'Guardar'}
                    </button>
                    </div>

                </form>
                </div>
            </div>
            )}

        </div>
        )
}

export default AdminUsuarios