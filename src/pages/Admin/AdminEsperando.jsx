import { useEffect, useState } from 'react'
import API_URL from '../../services/api'

function AdminEsperando() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    obtenerSolicitudes()
  }, [])

  const obtenerSolicitudes = async () => {
    try {
      setLoading(true)

      const res = await fetch(
        `${API_URL}/solicitudes?estado=EN_ESPERA`
      )

      const data = await res.json()

      if (data.ok) {
        setSolicitudes(data.solicitudes)
      }
    } catch (error) {
      console.error(
        'Error al obtener solicitudes en espera:',
        error
      )
    } finally {
      setLoading(false)
    }
  }

  const aprobarSolicitud = async (id) => {
    try {
      const res = await fetch(
        `${API_URL}/solicitudes/${id}/estado`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            estado: 'APROBADA'
          })
        }
      )

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

  return (
    <div>
      <div className="page-header">
        <h2>Solicitudes en espera</h2>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Solicitudes en espera de aprobación
          </h3>
        </div>

        {loading ? (
          <p>Cargando solicitudes...</p>
        ) : solicitudes.length === 0 ? (
          <p>No hay solicitudes en espera.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Solicitante</th>
                  <th>Embarcación</th>
                  <th>Tipo</th>
                  <th>Llegada</th>
                  <th>Salida</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {solicitudes.map((solicitud) => (
                  <tr key={solicitud.id}>
                    <td>
                      #{solicitud.id}
                    </td>

                    <td>
                      <strong>
                        {solicitud.fullname}
                      </strong>

                      <br />

                      <span className="text-muted">
                        {solicitud.email}
                      </span>

                      <br />

                      <span className="text-muted">
                        {solicitud.telefono}
                      </span>
                    </td>

                    <td>
                      {solicitud.nombre_bote}
                    </td>

                    <td>
                      {solicitud.tipo_barco}
                    </td>

                    <td>
                      {solicitud.fecha_llegada}
                    </td>

                    <td>
                      {solicitud.fecha_salida}
                    </td>

                    <td>
                      <span className="badge badge-warning">
                        {solicitud.estado}
                      </span>
                    </td>

                    <td>
                      <button
                        className="btn-action btn-approve"
                        onClick={() =>
                          aprobarSolicitud(solicitud.id)
                        }
                      >
                        Aprobar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminEsperando