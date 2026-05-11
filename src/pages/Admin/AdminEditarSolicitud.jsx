import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import API_URL from '../../services/api'
import './AdminEditarSolicitud.css'

function AdminEditarSolicitud() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const from = searchParams.get('from') || 'pendientes'

  const [form, setForm] = useState({
    fullname: '',
    email: '',
    telefono: '',
    nombre_bote: '',
    tipo_barco: '',
    eslora: '',
    manga: '',
    calado: '',
    fecha_llegada: '',
    fecha_salida: '',
    comentario: '',
    primera_entrada_mexico: false
  })

  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    obtenerSolicitud()
  }, [id])

  const obtenerSolicitud = async () => {
    try {
      const res = await fetch(`${API_URL}/solicitudes/${id}`)
      const data = await res.json()

      if (data.ok) {
        setForm({
          fullname: data.solicitud.fullname || '',
          email: data.solicitud.email || '',
          telefono: data.solicitud.telefono || '',
          nombre_bote: data.solicitud.nombre_bote || '',
          tipo_barco: data.solicitud.tipo_barco || '',
          eslora: data.solicitud.eslora || '',
          manga: data.solicitud.manga || '',
          calado: data.solicitud.calado || '',
          fecha_llegada:
            data.solicitud.fecha_llegada?.slice(0, 10) || '',
          fecha_salida:
            data.solicitud.fecha_salida?.slice(0, 10) || '',
          comentario: data.solicitud.comentario || '',
          primera_entrada_mexico:
            Number(data.solicitud.primera_entrada_mexico) === 1
        })
      }
    } catch (error) {
      console.error(error)
      alert('Error al cargar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const guardarCambios = async (e) => {
    e.preventDefault()

    try {
      setGuardando(true)

      const res = await fetch(`${API_URL}/solicitudes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...form,
          primera_entrada_mexico: form.primera_entrada_mexico ? 1 : 0
        })
      })

      const data = await res.json()

      if (!data.ok) {
        alert(data.error || 'No se pudieron guardar los cambios')
        return
      }

      alert('Cambios guardados correctamente')
      navigate(`/admin/${from}`)
    } catch (error) {
      console.error(error)
      alert('Error de conexión con el servidor')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return <p>Cargando solicitud...</p>
  }

  return (
    <form className="admin-editar-page" onSubmit={guardarCambios}>
      <div className="admin-editar-top">
        <h2>Editar solicitud #{id}</h2>

        <button
          type="button"
          className="btn-volver"
          onClick={() => navigate(`/admin/${from}`)}
        >
          ← Volver
        </button>
      </div>

      <section className="editar-card">
        <h3>Datos del cliente</h3>

        <div className="editar-grid editar-grid-2">
          <div className="editar-field">
            <label>Nombre completo</label>

            <input
              name="fullname"
              value={form.fullname}
              onChange={handleChange}
            />
          </div>

          <div className="editar-field">
            <label>Correo electrónico</label>

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="editar-field">
            <label>Teléfono</label>

            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      <section className="editar-card">
        <h3>Datos de la embarcación</h3>

        <div className="editar-grid editar-grid-2">
          <div className="editar-field">
            <label>Nombre de la embarcación</label>

            <input
              name="nombre_bote"
              value={form.nombre_bote}
              onChange={handleChange}
            />
          </div>

          <div className="editar-field">
            <label>Tipo de embarcación</label>

            <select
              name="tipo_barco"
              value={form.tipo_barco}
              onChange={handleChange}
            >
              <option value="">Seleccione una opción</option>
              <option value="YATE">Yate</option>
              <option value="VELERO">Velero</option>
              <option value="LANCHA">Lancha</option>
              <option value="CATAMARÁN">Catamarán</option>
            </select>
          </div>
        </div>

        <div className="editar-grid editar-grid-3">
          <div className="editar-field">
            <label>Eslora (m)</label>

            <input
              name="eslora"
              value={form.eslora}
              onChange={handleChange}
            />
          </div>

          <div className="editar-field">
            <label>Manga (m)</label>

            <input
              name="manga"
              value={form.manga}
              onChange={handleChange}
            />
          </div>

          <div className="editar-field">
            <label>Calado (m)</label>

            <input
              name="calado"
              value={form.calado}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      <section className="editar-card">
        <h3>Datos de la solicitud</h3>

        <div className="editar-grid editar-grid-2">
          <div className="editar-field">
            <label>Fecha de llegada</label>

            <input
              type="date"
              name="fecha_llegada"
              value={form.fecha_llegada}
              onChange={handleChange}
            />
          </div>

          <div className="editar-field">
            <label>Fecha de salida</label>

            <input
              type="date"
              name="fecha_salida"
              value={form.fecha_salida}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="editar-field">
          <label>Comentario</label>

          <textarea
            name="comentario"
            value={form.comentario}
            onChange={handleChange}
          />
        </div>

        <label className="editar-check">
          <input
            type="checkbox"
            name="primera_entrada_mexico"
            checked={form.primera_entrada_mexico}
            onChange={handleChange}
          />

          Primera entrada a México / First entry to Mexico
        </label>
      </section>

      <div className="editar-actions">
        <button type="submit" className="btn-guardar" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>

        <button
          type="button"
          className="btn-cancelar"
          onClick={() => navigate(`/admin/${from}`)}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default AdminEditarSolicitud