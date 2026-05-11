import { useEffect, useState } from 'react'
import API_URL from '../../services/api'
import './adminEsperando.css'

// Página que muestra solicitudes en estado EN_ESPERA.
// Permite revisar y aprobar solicitudes antes de asignarlas.
function AdminEsperando() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const [busqueda, setBusqueda] = useState('')
  const [tipoBarco, setTipoBarco] = useState('')
  const [fecha, setFecha] = useState('')

  useEffect(() => {
    obtenerSolicitudes()
  }, [])

  const obtenerSolicitudes = async () => {
    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/solicitudes?estado=EN_ESPERA`)
      const data = await res.json()

      if (data.ok) {
        setSolicitudes(data.solicitudes)
      }
    } catch (error) {
      console.error('Error al obtener solicitudes en espera:', error)
    } finally {
      setLoading(false)
    }
  }

  const aprobarSolicitud = async (id) => {
    try {
      const res = await fetch(`${API_URL}/solicitudes/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado: 'APROBADA'
        })
      })

      const data = await res.json()

      if (!data.ok) {
        alert(data.error || 'No se pudo aprobar')
        return
      }

      obtenerSolicitudes()
    } catch (error) {
      console.error(error)
      alert('Error de conexión')
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return '—'

    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const solicitudesFiltradas = solicitudes.filter((s) => {
    const texto = `${s.nombre_bote} ${s.fullname}`.toLowerCase()

    const coincideBusqueda = texto.includes(busqueda.toLowerCase())

    const coincideTipo = tipoBarco
      ? s.tipo_barco?.toUpperCase() === tipoBarco
      : true

    const coincideFecha = fecha
      ? String(s.fecha_llegada).slice(0, 10) === fecha
      : true

    return coincideBusqueda && coincideTipo && coincideFecha
  })

  return (
    <div className="admin-esperando-page">
      <div className="admin-esperando-header">
        <h2>Pendientes de asignación</h2>
      </div>

      <button
        type="button"
        className="admin-esperando-toggle"
        onClick={() => setMostrarFiltros(!mostrarFiltros)}
      >
        <span>⚙ Filtros</span>
        <span>{mostrarFiltros ? '▲' : '▼'}</span>
      </button>

      {mostrarFiltros && (
        <div className="admin-esperando-filters">
          <div>
            <div className="admin-esperando-group">
              <label>Buscar</label>
              <input
                placeholder="Embarcación o cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="admin-esperando-group">
              <label>Tipo de barco</label>
              <select
                value={tipoBarco}
                onChange={(e) => setTipoBarco(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="YATE">Yate</option>
                <option value="VELERO">Velero</option>
                <option value="LANCHA">Lancha</option>
                <option value="CATAMARÁN">Catamarán</option>
              </select>
            </div>

            <button
              type="button"
              className="admin-esperando-filter-btn"
            >
              Filtrar
            </button>
          </div>

          <div>
            <div className="admin-esperando-group">
              <label>Fecha</label>

              <div className="admin-date-tabs">
                <button className="active">✦ Solicitud</button>
                <button>→ Llegada</button>
                <button>← Salida</button>
                <button>↔ Estancia</button>
              </div>

              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />

              <small>
                ℹ Fecha exacta de solicitud · activa ↔ para rango
              </small>
            </div>

            <div className="admin-esperando-group">
              <label>Ordenar por</label>
              <select>
                <option>Más reciente</option>
                <option>Más antiguo</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="admin-esperando-table">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Embarcación</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Llegada</th>
              <th>Salida</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="admin-esperando-empty">
                  Cargando solicitudes...
                </td>
              </tr>
            ) : solicitudesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="8" className="admin-esperando-empty">
                  No hay solicitudes en espera.
                </td>
              </tr>
            ) : (
              solicitudesFiltradas.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td className="admin-esperando-id">
                    #{solicitud.id}
                  </td>

                  <td>{solicitud.nombre_bote}</td>

                  <td>{solicitud.fullname}</td>

                  <td>{solicitud.tipo_barco}</td>

                  <td>{formatearFecha(solicitud.fecha_llegada)}</td>

                  <td>{formatearFecha(solicitud.fecha_salida)}</td>

                  <td>
                    <span className="admin-esperando-badge">
                      En espera
                    </span>
                  </td>

                  <td>
                    <div className="admin-esperando-actions">
                      <button className="btn-contactar">
                        Contactar
                      </button>

                      <button className="btn-revisar">
                        Revisar
                      </button>

                      <button
                        className="btn-asignar"
                        onClick={() => aprobarSolicitud(solicitud.id)}
                      >
                        Asignar
                      </button>

                      <button className="btn-rechazar">
                        Rechazar
                      </button>

                      <button className="btn-ver">
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminEsperando