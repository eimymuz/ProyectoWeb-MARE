import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API_URL from '../../services/api'
import './adminEsperando.css'

function AdminEsperando() {
  const navigate = useNavigate()

  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const [busqueda, setBusqueda] = useState('')
  const [tipoBarco, setTipoBarco] = useState('')
  const [fecha, setFecha] = useState('')

  const [solicitudRechazo, setSolicitudRechazo] = useState(null)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [solicitudVer, setSolicitudVer] = useState(null)

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

  const contactarCliente = (solicitud) => {
    const email = solicitud.email
    const cliente = solicitud.fullname
    const embarcacion = solicitud.nombre_bote

    if (!email) {
      alert('Esta solicitud no tiene correo registrado.')
      return
    }

    const asunto = `Solicitud — ${embarcacion}`

    const cuerpo = `
Estimado/a ${cliente}:

Le contactamos respecto a su solicitud para la embarcación ${embarcacion}.

Su solicitud se encuentra actualmente en estado EN ESPERA.

Quedamos atentos a la información necesaria para continuar con el proceso de asignación.

Saludos cordiales.
MARE - Marina Puerto de la Navidad
    `

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      email
    )}&su=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`

    window.open(gmailUrl, '_blank')
  }

  const revisarCliente = (solicitud) => {
    const email = solicitud.email

    if (!email) {
      alert('Esta solicitud no tiene correo registrado.')
      return
    }

    const gmailSearchUrl = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(
      email
    )}`

    window.open(gmailSearchUrl, '_blank')
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

      cerrarModalVer()

      // Redirige al mapa con la solicitud preseleccionada
      navigate(`/admin/mapa?solicitud=${id}`)
    } catch (error) {
      console.error(error)
      alert('Error de conexión')
    }
  }

  const abrirModalRechazo = (solicitud) => {
    setSolicitudRechazo(solicitud)
    setMotivoRechazo('')
  }

  const cerrarModalRechazo = () => {
    setSolicitudRechazo(null)
    setMotivoRechazo('')
  }

  const rechazarSolicitud = async () => {
    if (!motivoRechazo.trim()) {
      alert('Debes escribir el motivo del rechazo.')
      return
    }

    try {
      const res = await fetch(
        `${API_URL}/solicitudes/${solicitudRechazo.id}/estado`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            estado: 'RECHAZADA',
            motivo_rechazo: motivoRechazo
          })
        }
      )

      const data = await res.json()

      if (!data.ok) {
        alert(data.error || 'No se pudo rechazar la solicitud.')
        return
      }

      cerrarModalRechazo()
      obtenerSolicitudes()
    } catch (error) {
      console.error(error)
      alert('Error de conexión')
    }
  }

  const abrirModalVer = (solicitud) => {
    setSolicitudVer(solicitud)
  }

  const cerrarModalVer = () => {
    setSolicitudVer(null)
  }

  const editarSolicitud = (solicitud) => {
    cerrarModalVer()

    navigate(`/admin/editar/${solicitud.id}?from=esperando`)
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return '—'

    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatearSiNo = (valor) => {
    return valor ? 'Sí' : 'No'
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

            <button type="button" className="admin-esperando-filter-btn">
              Filtrar
            </button>
          </div>

          <div>
            <div className="admin-esperando-group">
              <label>Fecha</label>

              <div className="admin-date-tabs">
                <button type="button" className="active">
                  ✦ Solicitud
                </button>
                <button type="button">→ Llegada</button>
                <button type="button">← Salida</button>
                <button type="button">↔ Estancia</button>
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
                  <td className="admin-esperando-id">#{solicitud.id}</td>
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
                      <button
                        type="button"
                        className="btn-contactar"
                        onClick={() => contactarCliente(solicitud)}
                      >
                        Contactar
                      </button>

                      <button
                        type="button"
                        className="btn-revisar"
                        onClick={() => revisarCliente(solicitud)}
                      >
                        Revisar
                      </button>

                      <button
                        type="button"
                        className="btn-asignar"
                        onClick={() => aprobarSolicitud(solicitud.id)}
                      >
                        Asignar
                      </button>

                      <button
                        type="button"
                        className="btn-rechazar"
                        onClick={() => abrirModalRechazo(solicitud)}
                      >
                        Rechazar
                      </button>

                      <button
                        type="button"
                        className="btn-ver"
                        onClick={() => abrirModalVer(solicitud)}
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

      {solicitudRechazo && (
        <div className="reject-modal-overlay">
          <div className="reject-modal">
            <h3>Rechazar solicitud</h3>

            <p>
              Embarcación:{' '}
              <strong>{solicitudRechazo.nombre_bote}</strong>
            </p>

            <label>
              Motivo del rechazo <span>*</span>
            </label>

            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Describe el motivo por el cual se rechaza esta solicitud..."
              rows="5"
            />

            <div className="reject-modal-actions">
              <button
                type="button"
                className="btn-cancelar"
                onClick={cerrarModalRechazo}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-confirmar-rechazo"
                onClick={rechazarSolicitud}
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {solicitudVer && (
        <div className="solicitud-modal-overlay">
          <div className="solicitud-modal">
            <div className="solicitud-modal-header">
              <div>
                <div className="modal-title-row">
                  <h2>{solicitudVer.nombre_bote}</h2>
                  <span className="modal-status">En espera</span>
                </div>

                <p>
                  {solicitudVer.fullname} · Solicitud #{solicitudVer.id}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={cerrarModalVer}
              >
                ×
              </button>
            </div>

            <div className="solicitud-modal-body">
              <div className="modal-column">
                <h4>Embarcación</h4>

                <div className="modal-item">
                  <span>Tipo</span>
                  <strong>{solicitudVer.tipo_barco || '—'}</strong>
                </div>

                <div className="modal-item">
                  <span>Eslora</span>
                  <strong>{solicitudVer.eslora || '—'} m</strong>
                </div>

                <div className="modal-item">
                  <span>Manga</span>
                  <strong>{solicitudVer.manga || '—'} m</strong>
                </div>

                <div className="modal-item">
                  <span>Calado</span>
                  <strong>{solicitudVer.calado || '—'} m</strong>
                </div>
              </div>

              <div className="modal-column">
                <h4>Cliente</h4>

                <div className="modal-item">
                  <span>Nombre</span>
                  <strong>{solicitudVer.fullname || '—'}</strong>
                </div>

                <div className="modal-item">
                  <span>Email</span>
                  <strong className="modal-link">
                    {solicitudVer.email || '—'}
                  </strong>
                </div>

                <div className="modal-item">
                  <span>Teléfono</span>
                  <strong>{solicitudVer.telefono || '—'}</strong>
                </div>

                <div className="modal-item">
                  <span>1ª entrada MX</span>
                  <strong className="modal-gold">
                    {formatearSiNo(
                      solicitudVer.primera_entrada_mexico
                    )}
                  </strong>
                </div>
              </div>

              <div className="modal-column">
                <h4>Estancia</h4>

                <div className="modal-item">
                  <span>Solicitud</span>
                  <strong>
                    {formatearFecha(solicitudVer.fecha_solicitud)}
                  </strong>
                </div>

                <div className="modal-item">
                  <span>Llegada</span>
                  <strong>
                    {formatearFecha(solicitudVer.fecha_llegada)}
                  </strong>
                </div>

                <div className="modal-item">
                  <span>Salida</span>
                  <strong>
                    {formatearFecha(solicitudVer.fecha_salida)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="solicitud-modal-footer">
              <div>
                <button
                  type="button"
                  className="btn-asignar"
                  onClick={() => aprobarSolicitud(solicitudVer.id)}
                >
                  Aprobar
                </button>

                <button
                  type="button"
                  className="btn-rechazar"
                  onClick={() => {
                    cerrarModalVer()
                    abrirModalRechazo(solicitudVer)
                  }}
                >
                  Rechazar
                </button>

                <button
                  type="button"
                  className="btn-ver"
                  onClick={() => editarSolicitud(solicitudVer)}
                >
                  Editar
                </button>
              </div>

              <button
                type="button"
                className="btn-cancelar"
                onClick={cerrarModalVer}
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

export default AdminEsperando