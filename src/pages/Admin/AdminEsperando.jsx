import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAuth } from '../../services/api'
import './styles/AdminEsperando.css'
import Toast from '../../components/admin/Toast'

function AdminEsperando() {
  const navigate = useNavigate()

  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [toast, setToast] = useState(null)

  const [busqueda, setBusqueda] = useState('')
  const [tipoBarco, setTipoBarco] = useState('')
  const [fecha, setFecha] = useState('')

  const [solicitudRechazo, setSolicitudRechazo] = useState(null)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [solicitudVer, setSolicitudVer] = useState(null)

  const [paginaActual, setPaginaActual] = useState(1)
  const ITEMS_POR_PAGINA = 10

  useEffect(() => {
    obtenerSolicitudes()
  }, [])

  useEffect(() => {
    setPaginaActual(1)
  }, [busqueda, tipoBarco, fecha])

  const obtenerSolicitudes = async () => {
    try {
      setLoading(true)

      const res = await fetchAuth('/solicitudes?estado=EN_ESPERA')
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
    if (!solicitud.email) {
      setToast({
        mensaje: 'Esta solicitud no tiene correo registrado.',
        tipo: 'warning'
      })
      return
    }

    const asunto = `Solicitud — ${solicitud.nombre_bote}`

    const cuerpo = `
Estimado/a ${solicitud.fullname}:

Le contactamos respecto a su solicitud para la embarcación ${solicitud.nombre_bote}.

Su solicitud se encuentra actualmente en estado EN ESPERA.

Quedamos atentos a la información necesaria para continuar con el proceso de asignación.

Saludos cordiales.
MARE - Marina Puerto de la Navidad
    `

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      solicitud.email
    )}&su=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`

    window.open(gmailUrl, '_blank')
  }

  const revisarCliente = (solicitud) => {
    if (!solicitud.email) {
      setToast({
        mensaje: 'Esta solicitud no tiene correo registrado.',
        tipo: 'warning'
      })
      return
    }

    const gmailSearchUrl = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(
      solicitud.email
    )}`

    window.open(gmailSearchUrl, '_blank')
  }

  const aprobarSolicitud = async (id) => {
    try {
      const res = await fetchAuth(`/solicitudes/${id}/estado`, {
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
        setToast({
          mensaje: data.error || 'No se pudo aprobar la solicitud',
          tipo: 'error'
        })
        return
      }

      cerrarModalVer()

      navigate(`/admin/mapa?solicitud=${id}`)
    } catch (error) {
      console.error(error)

      setToast({
        mensaje: 'Error de conexión con el servidor',
        tipo: 'error'
      })
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
      setToast({
        mensaje: 'Debes escribir el motivo del rechazo',
        tipo: 'error'
      })
      return
    }

    if (motivoRechazo.trim().length < 10) {
      setToast({
        mensaje: 'El motivo debe tener al menos 10 caracteres',
        tipo: 'error'
      })
      return
    }

    if (motivoRechazo.length > 500) {
      setToast({
        mensaje: 'El motivo no puede superar los 500 caracteres',
        tipo: 'warning'
      })
      return
    }

    try {
      const res = await fetchAuth(`/solicitudes/${solicitudRechazo.id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado: 'RECHAZADA',
          motivo: motivoRechazo
        })
      })

      const data = await res.json()

      if (!data.ok) {
        setToast({
          mensaje: data.error || 'No se pudo rechazar la solicitud',
          tipo: 'error'
        })
        return
      }

      cerrarModalRechazo()
      obtenerSolicitudes()
    } catch (error) {
      console.error(error)

      setToast({
        mensaje: 'Error de conexión',
        tipo: 'error'
      })
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

  const limpiarFiltros = () => {
    setBusqueda('')
    setTipoBarco('')
    setFecha('')
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
    return Number(valor) === 1 || valor === true ? 'Sí' : 'No'
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

  const totalPaginas = Math.ceil(solicitudesFiltradas.length / ITEMS_POR_PAGINA)

  const solicitudesPaginadas = solicitudesFiltradas.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  )

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
                <option value="MOTONAVE">Motonave</option>
              </select>
            </div>

            <button
              type="button"
              className="admin-esperando-filter-btn"
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>
          </div>

          <div>
            <div className="admin-esperando-group">
              <label>Fecha de llegada</label>

              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />

              <small>
                Filtra por fecha exacta de llegada.
              </small>
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
              solicitudesPaginadas.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td className="admin-esperando-id">
                    #{solicitud.id}
                  </td>

                  <td>{solicitud.nombre_bote}</td>
                  <td>{solicitud.fullname}</td>
                  <td>{solicitud.tipo_barco}</td>

                  <td>
                    {formatearFecha(solicitud.fecha_llegada)}
                  </td>

                  <td>
                    {formatearFecha(solicitud.fecha_salida)}
                  </td>

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

        {totalPaginas > 1 && (
          <div className="paginacion">
            <button
              type="button"
              className="pag-btn"
              onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
              disabled={paginaActual === 1}
            >
              ‹ Anterior
            </button>

            <div className="pag-numeros">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`pag-num ${paginaActual === num ? 'active' : ''}`}
                  onClick={() => setPaginaActual(num)}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="pag-btn"
              onClick={() =>
                setPaginaActual((p) => Math.min(p + 1, totalPaginas))
              }
              disabled={paginaActual === totalPaginas}
            >
              Siguiente ›
            </button>
          </div>
        )}
      </div>

      {solicitudRechazo && (
        <div
          className="solicitud-modal-overlay"
          onClick={cerrarModalRechazo}
        >
          <div
            className="reject-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Rechazar solicitud</h3>

            <p>
              Embarcación: <strong>{solicitudRechazo.nombre_bote}</strong>
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

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '3px'
              }}
            >
              {motivoRechazo.trim().length > 0 &&
                motivoRechazo.trim().length < 10 && (
                  <span style={{ fontSize: '11px', color: '#c0392b' }}>
                    Mínimo 10 caracteres
                  </span>
                )}

              <span
                style={{
                  fontSize: '11px',
                  color: motivoRechazo.length > 500 ? '#c0392b' : '#aaa',
                  marginLeft: 'auto'
                }}
              >
                {motivoRechazo.length}/500
              </span>
            </div>

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
        <div
          className="solicitud-modal-overlay"
          onClick={cerrarModalVer}
        >
          <div
            className="solicitud-modal"
            onClick={(e) => e.stopPropagation()}
          >
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
                    {formatearSiNo(solicitudVer.primera_entrada_mexico)}
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

            {solicitudVer.comentario && (
              <div className="modal-comentario">
                <h4>Comentario del cliente</h4>
                <p>{solicitudVer.comentario}</p>
              </div>
            )}

            <div className="solicitud-modal-footer">
              <div>
                <button
                  type="button"
                  className="btn-contactar"
                  onClick={() => contactarCliente(solicitudVer)}
                >
                  Contactar
                </button>

                <button
                  type="button"
                  className="btn-revisar"
                  onClick={() => revisarCliente(solicitudVer)}
                >
                  Revisar
                </button>

                <button
                  type="button"
                  className="btn-asignar"
                  onClick={() => aprobarSolicitud(solicitudVer.id)}
                >
                  Asignar
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

      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default AdminEsperando