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

  const [historial, setHistorial] = useState([])
  const [loadingHistorial, setLoadingHistorial] = useState(false)

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
    navigate(`/admin/mapa?solicitud=${solicitudId}&reasignar=1`)
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



  // Carga el historial de asignaciones de una solicitud al abrir el modal
  const cargarHistorial = async (solicitudId) => {
    try {
      setLoadingHistorial(true)
      const res = await fetchAuth(`/mapa/asignaciones/${solicitudId}/historial`)
      const data = await res.json()
      if (data.ok) setHistorial(data.historial)
    } catch (error) {
      console.error('Error al cargar historial:', error)
    } finally {
      setLoadingHistorial(false)
    }
  }


  // Formatea fecha con hora sin minutos — ej: 16/05/2026 10h
  const formatearFechaHora = (fecha) => {
    if (!fecha) return '—'
    const d = new Date(fecha)
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + d.getHours() + 'h'
  }

  // Botones!!
        // Abre Gmail para contactar al cliente sobre su asignación
        const contactarCliente = (a) => {
          if (!a.email) {
            alert('Esta solicitud no tiene correo registrado.')
            return
          }

          const asunto = `Asignación — ${a.nombre_bote}`
          const cuerpo = `
        Estimado/a ${a.fullname}:

        Le contactamos respecto a su embarcación ${a.nombre_bote}, 
        actualmente asignada en el Muelle ${a.muelle_nombre}, Espacio ${a.espacio_numero}.

        Quedamos atentos a cualquier consulta.

        Saludos cordiales.
        MARE - Marina Puerto de la Navidad
          `

          const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(a.email)}&su=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`
          window.open(gmailUrl, '_blank')
        }

        // Busca el email del cliente en Gmail para revisar conversaciones previas
        const revisarCliente = (a) => {
          if (!a.email) {
            alert('Esta solicitud no tiene correo registrado.')
            return
          }
          window.open(`https://mail.google.com/mail/u/0/#search/${encodeURIComponent(a.email)}`, '_blank')
        }

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
                        onClick={() => {
                        setVerModal(a)
                        cargarHistorial(a.solicitud_id)
                      }}
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
            {/* HEADER */}
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
              >×</button>
            </div>

            {/* BODY — 3 columnas */}
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
                <div className="modal-item">
                  <span>1ª entrada MX</span>
                  <strong>{verModal.primera_entrada_mexico ? 'Sí' : 'No'}</strong>
                </div>
              </div>

              <div className="modal-column">
                <h4>Estancia</h4>
                <div className="modal-item">
                  <span>Solicitud</span>
                  <strong>{formatearFecha(verModal.fecha_solicitud)}</strong>
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

            {/* COMENTARIO DEL CLIENTE */}
            {verModal.comentario && (
              <div className="modal-comentario">
                <h4>Comentario del cliente</h4>
                <p>{verModal.comentario}</p>
              </div>
            )}

            {/* HISTORIAL DE UBICACIONES */}
            <div className="modal-historial">
              <h4>Historial de ubicaciones</h4>

              {loadingHistorial ? (
                <p className="historial-loading">Cargando historial...</p>
              ) : historial.length === 0 ? (
                <p className="historial-loading">Sin historial.</p>
              ) : (
                <div className="historial-scroll">
                  <table className="historial-table">
                    <thead>
                      <tr>
                        <th>Muelle</th>
                        <th>Espacio</th>
                        <th>Asignado el</th>
                        <th>Inicio</th>
                        <th>Fin</th>
                        <th>Admin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historial.map((h) => (
                        <tr key={h.asignacion_id}>
                          <td>
                            {h.muelle_nombre}
                            {h.activa ? (
                              <span className="badge-actual">actual</span>
                            ) : null}
                          </td>
                          <td>{h.espacio_numero}</td>
                          <td>{formatearFechaHora(h.fecha_asignacion)}</td>
                          <td>{formatearFecha(h.fecha_inicio)}</td>
                          <td>{formatearFecha(h.fecha_fin)}</td>
                          <td className="historial-admin">{h.admin_nombre}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="solicitud-modal-footer">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-contactar"
                  onClick={() => contactarCliente(verModal)}
                >
                  Contactar
                </button>

                <button
                  type="button"
                  className="btn-revisar"
                  onClick={() => revisarCliente(verModal)}
                >
                  Revisar
                </button>

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
                  className="btn-editar"
                  onClick={() => {
                    setVerModal(null)
                    navigate(`/admin/editar/${verModal.solicitud_id}?from=asignadas`)
                  }}
                >
                  Editar
                </button>
              </div>

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