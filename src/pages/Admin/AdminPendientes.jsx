import { useEffect, useState } from 'react'
import API_URL from '../../services/api'
import './AdminPendientes.css'

function AdminPendientes() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)

  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [tipoBarco, setTipoBarco] = useState('')
  const [primeraEntrada, setPrimeraEntrada] = useState(false)
  const [fecha, setFecha] = useState('')

  const [rechazandoId, setRechazandoId] = useState(null)
  const [motivo, setMotivo] = useState('')

  useEffect(() => {
    obtenerSolicitudes()
  }, [])

  const obtenerSolicitudes = async () => {
    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/solicitudes?estado=PENDIENTE`)
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
      const res = await fetch(`${API_URL}/solicitudes/${id}/estado`, {
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

      setRechazandoId(null)
      setMotivo('')
      obtenerSolicitudes()
    } catch (error) {
      console.error(error)
      alert('Error de conexión con el servidor')
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

    const coincideEntrada = primeraEntrada
      ? Number(s.primera_entrada_mexico) === 1
      : true

    const coincideFecha = fecha
      ? String(s.fecha_llegada).slice(0, 10) === fecha
      : true

    return coincideBusqueda && coincideTipo && coincideEntrada && coincideFecha
  })

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
              solicitudesFiltradas.map((solicitud) => (
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
                        className="btn-wait"
                        onClick={() =>
                          cambiarEstado(solicitud.id, 'EN_ESPERA')
                        }
                      >
                        En espera
                      </button>

                      <button
                        className="btn-reject"
                        onClick={() => setRechazandoId(solicitud.id)}
                      >
                        Rechazar
                      </button>

                      <button className="btn-view">
                        Ver
                      </button>
                    </div>

                    {rechazandoId === solicitud.id && (
                      <div className="reject-box">
                        <textarea
                          value={motivo}
                          onChange={(e) => setMotivo(e.target.value)}
                          placeholder="Motivo de rechazo..."
                        />

                        <div className="reject-actions">
                          <button
                            className="btn-reject"
                            onClick={() =>
                              cambiarEstado(
                                solicitud.id,
                                'RECHAZADA',
                                motivo
                              )
                            }
                          >
                            Confirmar
                          </button>

                          <button
                            className="btn-cancel"
                            onClick={() => {
                              setRechazandoId(null)
                              setMotivo('')
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
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

export default AdminPendientes