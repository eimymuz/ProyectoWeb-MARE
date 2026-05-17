import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAuth } from '../../services/api'
import './AdminAsignadas.css'

// Página de embarcaciones con espacio asignado en la marina.
// Muestra solicitudes APROBADAS con asignación activa.
// Permite reasignar al mapa o ver el detalle de cada una.
function AdminAsignadas() {
  const navigate = useNavigate()

  const [asignaciones, setAsignaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [muelle, setMuelle] = useState('')
  const [tipoBarco, setTipoBarco] = useState('')
  const [fechaSalida, setFechaSalida] = useState('')

  // Modal de detalle
  const [verModal, setVerModal] = useState(null)

  useEffect(() => {
    obtenerAsignaciones()
  }, [])

  const obtenerAsignaciones = async () => {
    try {
      setLoading(true)
      const res = await fetchAuth('/mapa/asignaciones')
      const data = await res.json()
      if (data.ok) setAsignaciones(data.asignaciones)
    } catch (error) {
      console.error('Error al obtener asignaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  // Redirige al mapa con la solicitud preseleccionada para reasignar
  const reasignar = (solicitudId) => {
    navigate(`/admin/mapa?solicitud=${solicitudId}`)
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return '—'
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Lista de muelles únicos para el filtro
  const muelles = [...new Set(asignaciones.map(a => a.muelle_nombre))].sort()

  const asignacionesFiltradas = asignaciones.filter(a => {
    const texto = `${a.nombre_bote} ${a.fullname}`.toLowerCase()

    const coincideBusqueda = texto.includes(busqueda.toLowerCase())
    const coincideMuelle = muelle ? a.muelle_nombre === muelle : true
    const coincideTipo = tipoBarco ? a.tipo_barco === tipoBarco : true
    const coincideFecha = fechaSalida
      ? String(a.fecha_salida).slice(0, 10) === fechaSalida
      : true

    return coincideBusqueda && coincideMuelle && coincideTipo && coincideFecha
  })

  return (
    <div className="admin-asignadas-page">

      <div className="admin-asignadas-header">
        <h2>Asignadas — en marina</h2>
      </div>

      {/* FILTROS */}
      <button
        type="button"
        className="admin-asignadas-toggle"
        onClick={() => setMostrarFiltros(!mostrarFiltros)}
      >
        <span>⚙ Filtros</span>
        <span>{mostrarFiltros ? '▲' : '▼'}</span>
      </button>

      {mostrarFiltros && (
        <div className="admin-asignadas-filters">
          <div>
            <div className="admin-filter-group">
              <label>Buscar</label>
              <input
                placeholder="Embarcación o cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="admin-filter-group">
              <label>Muelle actual</label>
              <select value={muelle} onChange={(e) => setMuelle(e.target.value)}>
                <option value="">Todos</option>
                {muelles.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="admin-filter-group">
              <label>Tipo de barco</label>
              <select value={tipoBarco} onChange={(e) => setTipoBarco(e.target.value)}>
                <option value="">Todos</option>
                <option value="YATE">Yate</option>
                <option value="VELERO">Velero</option>
                <option value="LANCHA">Lancha</option>
                <option value="CATAMARÁN">Catamarán</option>
                <option value="MOTONAVE">Motonave</option>
              </select>
            </div>
          </div>

          <div>
            <div className="admin-filter-group">
              <label>Fecha de salida</label>
              <input
                type="date"
                value={fechaSalida}
                onChange={(e) => setFechaSalida(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="admin-filter-btn secondary"
              onClick={() => {
                setBusqueda('')
                setMuelle('')
                setTipoBarco('')
                setFechaSalida('')
              }}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {/* TABLA */}
      <div className="admin-asignadas-table">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Embarcación</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Llegada</th>
              <th>Salida</th>
              <th>Ubicación actual</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="admin-empty">
                  Cargando asignaciones...
                </td>
              </tr>
            ) : asignacionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="8" className="admin-empty">
                  No hay embarcaciones asignadas.
                </td>
              </tr>
            ) : (
              asignacionesFiltradas.map((a) => (
                <tr key={a.asignacion_id}>
                  <td className="admin-id">#{a.solicitud_id}</td>
                  <td>{a.nombre_bote}</td>
                  <td>{a.fullname}</td>
                  <td>{a.tipo_barco}</td>
                  <td>{formatearFecha(a.fecha_llegada)}</td>
                  <td>{formatearFecha(a.fecha_salida)}</td>

                  <td>
                    {/* Muelle — Espacio */}
                    <span className="ubicacion-badge">
                      {a.muelle_nombre} — {a.espacio_numero}
                    </span>
                  </td>

                  <td>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="btn-reasignar"
                        onClick={() => reasignar(a.solicitud_id)}
                      >
                        Reasignar
                      </button>

                      <button
                        type="button"
                        className="btn-view"
                        onClick={() => setVerModal(a)}
                      >
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

      {/* MODAL VER DETALLE */}
      {verModal && (
        <div
          className="solicitud-modal-overlay"
          onClick={() => setVerModal(null)}
        >
          <div
            className="solicitud-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="solicitud-modal-header">
              <div>
                <div className="modal-title-row">
                  <h2>{verModal.nombre_bote}</h2>
                  <span className="modal-status asignada">Asignada</span>
                </div>
                <p>{verModal.fullname} · Solicitud #{verModal.solicitud_id}</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setVerModal(null)}
              >
                ×
              </button>
            </div>

            <div className="solicitud-modal-body">
              <div className="modal-column">
                <h4>Embarcación</h4>
                <div className="modal-item">
                  <span>Tipo</span>
                  <strong>{verModal.tipo_barco}</strong>
                </div>
                <div className="modal-item">
                  <span>Eslora</span>
                  <strong>{verModal.eslora} m</strong>
                </div>
                <div className="modal-item">
                  <span>Manga</span>
                  <strong>{verModal.manga} m</strong>
                </div>
                <div className="modal-item">
                  <span>Calado</span>
                  <strong>{verModal.calado} m</strong>
                </div>
              </div>

              <div className="modal-column">
                <h4>Cliente</h4>
                <div className="modal-item">
                  <span>Nombre</span>
                  <strong>{verModal.fullname}</strong>
                </div>
                <div className="modal-item">
                  <span>Email</span>
                  <strong>{verModal.email}</strong>
                </div>
                <div className="modal-item">
                  <span>Teléfono</span>
                  <strong>{verModal.telefono}</strong>
                </div>
              </div>

              <div className="modal-column">
                <h4>Asignación</h4>
                <div className="modal-item">
                  <span>Muelle</span>
                  <strong>{verModal.muelle_nombre}</strong>
                </div>
                <div className="modal-item">
                  <span>Espacio</span>
                  <strong>{verModal.espacio_numero}</strong>
                </div>
                <div className="modal-item">
                  <span>Llegada</span>
                  <strong>{formatearFecha(verModal.fecha_llegada)}</strong>
                </div>
                <div className="modal-item">
                  <span>Salida</span>
                  <strong>{formatearFecha(verModal.fecha_salida)}</strong>
                </div>
              </div>
            </div>

            <div className="solicitud-modal-footer">
              <button
                type="button"
                className="btn-reasignar"
                onClick={() => {
                  setVerModal(null)
                  reasignar(verModal.solicitud_id)
                }}
              >
                Reasignar
              </button>

              <button
                type="button"
                className="btn-view"
                onClick={() => setVerModal(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminAsignadas