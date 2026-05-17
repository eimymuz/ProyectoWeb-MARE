import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAuth } from '../../services/api'
import './styles/adminPendientes.css'
import Toast from '../../components/admin/Toast'


function AdminPendientes() {
  const navigate = useNavigate()

  // Estados para solicitudes, carga, filtros, modales y toast
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [toast, setToast] = useState(null)


  const [busqueda, setBusqueda] = useState('')
  const [tipoBarco, setTipoBarco] = useState('')
  const [primeraEntrada, setPrimeraEntrada] = useState(false)
  const [fecha, setFecha] = useState('')

  const [solicitudRechazo, setSolicitudRechazo] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [solicitudVer, setSolicitudVer] = useState(null)

  useEffect(() => {
    obtenerSolicitudes()
  }, [])



  const obtenerSolicitudes = async () => {
    try {
      setLoading(true)

      const res = await fetchAuth(`/solicitudes?estado=PENDIENTE`)
      const data = await res.json()

      if (data.ok) {
        setSolicitudes(data.solicitudes)
      }
    } catch (error) {
      console.error('Error al obtener solicitudes:', error)
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstado = async (id, estado, motivoRechazo = '') => {
    try {
      const res = await fetchAuth(`/solicitudes/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado,
          motivo: motivoRechazo
        })
      })

      const data = await res.json()

      if (!data.ok) {
        alert(data.error || 'No se pudo actualizar la solicitud')
        return
      }

      setSolicitudRechazo(null)
      setMotivo('')
      setSolicitudVer(null)

      obtenerSolicitudes()
    } catch (error) {
      console.error(error)
      alert('Error de conexión con el servidor')
    }
  }

  const editarSolicitud = (solicitud) => {
    setSolicitudVer(null)

    navigate(`/admin/editar/${solicitud.id}?from=pendientes`)
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

    const coincideEntrada = primeraEntrada
      ? Number(s.primera_entrada_mexico) === 1
      : true

    const coincideFecha = fecha
      ? String(s.fecha_llegada).slice(0, 10) === fecha
      : true

    return (
      coincideBusqueda &&
      coincideTipo &&
      coincideEntrada &&
      coincideFecha
    )
  })


    // Paginación — 10 solicitudes por página
  const [paginaActual, setPaginaActual] = useState(1)
  const ITEMS_POR_PAGINA = 10

  // Calcula el total de páginas y las solicitudes de la página actual
  const totalPaginas = Math.ceil(solicitudesFiltradas.length / ITEMS_POR_PAGINA)

  const solicitudesPaginadas = solicitudesFiltradas.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  )

  // Resetea a página 1 cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1)
  }, [busqueda, tipoBarco, primeraEntrada, fecha])


  return (
    <div className="admin-pendientes-page">
      <div className="admin-pendientes-header">
        <h2>Solicitudes pendientes</h2>
      </div>

      <button
        type="button"
        className="admin-pendientes-toggle"
        onClick={() => setMostrarFiltros(!mostrarFiltros)}
      >
        <span>⚙ Filtros</span>
        <span>{mostrarFiltros ? '▲' : '▼'}</span>
      </button>

      {mostrarFiltros && (
        <div className="admin-pendientes-filters">
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

            <label className="admin-check">
              <input
                type="checkbox"
                checked={primeraEntrada}
                onChange={(e) => setPrimeraEntrada(e.target.checked)}
              />
              Primera entrada a México
            </label>
          </div>

          <div>
            <div className="admin-filter-group">
              <label>Fecha de llegada</label>

              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="admin-filter-btn secondary"
              onClick={() => {
                setBusqueda('')
                setTipoBarco('')
                setPrimeraEntrada(false)
                setFecha('')
              }}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      <div className="admin-pendientes-table">
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
                <td colSpan="8" className="admin-empty">
                  Cargando solicitudes...
                </td>
              </tr>
            ) : solicitudesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="8" className="admin-empty">
                  No hay solicitudes en este estado.
                </td>
              </tr>
            ) : (
              solicitudesPaginadas.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td className="admin-id">#{solicitud.id}</td>

                  <td>{solicitud.nombre_bote}</td>
                  <td>{solicitud.fullname}</td>
                  <td>{solicitud.tipo_barco}</td>
                  <td>{formatearFecha(solicitud.fecha_llegada)}</td>
                  <td>{formatearFecha(solicitud.fecha_salida)}</td>

                  <td>
                    <span className="admin-badge">
                      Pendiente
                    </span>
                  </td>

                  <td>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="btn-wait"
                        onClick={() =>
                          cambiarEstado(solicitud.id, 'EN_ESPERA')
                        }
                      >
                        En espera
                      </button>

                      <button
                        type="button"
                        className="btn-reject"
                        onClick={() => setSolicitudRechazo(solicitud)}
                      >
                        Rechazar
                      </button>

                      <button
                        type="button"
                        className="btn-view"
                        onClick={() => setSolicitudVer(solicitud)}
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
          {/* PAGINACIÓN */}
          {totalPaginas > 1 && (
            <div className="paginacion">
              <button
                type="button"
                className="pag-btn"
                onClick={() => setPaginaActual(p => Math.max(p - 1, 1))}
                disabled={paginaActual === 1}
              >
                ‹ Anterior
              </button>

              <div className="pag-numeros">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
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
                onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
              >
                Siguiente ›
              </button>
            </div>
          )}
      </div>

      {solicitudVer && (
        <div
          className="solicitud-modal-overlay"
          onClick={() => setSolicitudVer(null)}
        >
          <div
            className="solicitud-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="solicitud-modal-header">
              <div>
                <div className="modal-title-row">
                  <h2>{solicitudVer.nombre_bote}</h2>

                  <span className="modal-status">
                    Pendiente
                  </span>
                </div>

                <p>
                  {solicitudVer.fullname} · Solicitud #
                  {solicitudVer.id}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setSolicitudVer(null)}
              >
                ×
              </button>
            </div>

            <div className="solicitud-modal-body">
              <div className="modal-column">
                <h4>Embarcación</h4>

                <div className="modal-item">
                  <span>Tipo</span>
                  <strong>{solicitudVer.tipo_barco}</strong>
                </div>

                <div className="modal-item">
                  <span>Eslora</span>
                  <strong>{solicitudVer.eslora} m</strong>
                </div>

                <div className="modal-item">
                  <span>Manga</span>
                  <strong>{solicitudVer.manga} m</strong>
                </div>

                <div className="modal-item">
                  <span>Calado</span>
                  <strong>{solicitudVer.calado} m</strong>
                </div>
              </div>

              <div className="modal-column">
                <h4>Cliente</h4>

                <div className="modal-item">
                  <span>Nombre</span>
                  <strong>{solicitudVer.fullname}</strong>
                </div>

                <div className="modal-item">
                  <span>Email</span>
                  <strong className="modal-link">
                    {solicitudVer.email}
                  </strong>
                </div>

                <div className="modal-item">
                  <span>Teléfono</span>
                  <strong>{solicitudVer.telefono}</strong>
                </div>

                <div className="modal-item">
                  <span>1ª entrada MX</span>

                  <strong className="modal-gold">
                    {Number(solicitudVer.primera_entrada_mexico) === 1
                      ? 'Sí'
                      : 'No'}
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

            {/* COMENTARIO DEL CLIENTE */}
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
                  className="btn-wait"
                  onClick={() =>
                    cambiarEstado(solicitudVer.id, 'EN_ESPERA')
                  }
                >
                  En espera
                </button>

                <button
                  type="button"
                  className="btn-reject"
                  onClick={() => {
                    setSolicitudRechazo(solicitudVer)
                    setSolicitudVer(null)
                  }}
                >
                  Rechazar
                </button>

                <button
                  type="button"
                  className="btn-view"
                  onClick={() => editarSolicitud(solicitudVer)}
                >
                  Editar
                </button>
              </div>

              <button
                type="button"
                className="btn-view"
                onClick={() => setSolicitudVer(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {solicitudRechazo && (
        <div
          className="reject-modal-overlay"
          onClick={() => {
            setSolicitudRechazo(null)
            setMotivo('')
          }}
        >
          <div
            className="reject-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Rechazar solicitud</h3>

            <p>
              Embarcación:{' '}
              <strong>{solicitudRechazo.nombre_bote}</strong>
            </p>

            <label>
              Motivo del rechazo <span>*</span>
            </label>

            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describe el motivo por el cual se rechaza esta solicitud..."
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
              {motivo.trim().length > 0 && motivo.trim().length < 10 && (
                <span style={{ fontSize: '11px', color: '#c0392b' }}>Mínimo 10 caracteres</span>
              )}
              <span style={{ fontSize: '11px', color: motivo.length > 500 ? '#c0392b' : '#aaa', marginLeft: 'auto' }}>
                {motivo.length}/500
              </span>
            </div>

            <div className="reject-modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setSolicitudRechazo(null)
                  setMotivo('')
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-reject"
                onClick={() => {
                  if (!motivo.trim()) {
                    setToast({ mensaje: 'Debe escribir el motivo del rechazo', tipo: 'error' })
                    return
                  }

                  if (motivo.trim().length < 10) {
                    setToast({ mensaje: 'El motivo debe tener al menos 10 caracteres', tipo: 'error' })
                    return
                  }

                  if (motivo.length > 500) {
                    setToast({ mensaje: 'El motivo no puede superar los 500 caracteres', tipo: 'warning' })
                    return
                  }

                  cambiarEstado(
                    solicitudRechazo.id,
                    'RECHAZADA',
                    motivo
                  )
                }}
              >
                Confirmar rechazo
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

export default AdminPendientes