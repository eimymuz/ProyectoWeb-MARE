import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import API_URL from '../../services/api'

import './styles/AdminReportes.css'

/*
  AdminReportes
  Página administrativa encargada de mostrar el listado de reportes
  generados a partir de solicitudes aprobadas y rechazadas.

  Funciones principales:
  - Consulta solicitudes desde la API.
  - Filtra únicamente solicitudes APROBADA y RECHAZADA.
  - Permite filtrar por estado, mes y año.
  - Muestra la información en una tabla.
  - Redirige al módulo de estadísticas.
*/

function AdminReportes() {
  // Hook para redireccionar a otras rutas del panel administrativo
  const navigate = useNavigate()

  // Lista de solicitudes obtenidas desde el backend
  const [solicitudes, setSolicitudes] = useState([])

  // Filtros seleccionados por el usuario
  const [estado, setEstado] = useState('TODOS')
  const [mes, setMes] = useState('TODOS')
  const [anio, setAnio] = useState('TODOS')

  // Controla el estado de carga de los datos
  const [loading, setLoading] = useState(true)

  /*
    Al cargar el componente por primera vez,
    se consultan las solicitudes disponibles.
  */
  useEffect(() => {
    obtenerSolicitudes()
  }, [])

  /*
    Obtiene las solicitudes desde la API.

    Después de recibir los datos, conserva únicamente
    aquellas solicitudes que ya tienen una resolución:
    - APROBADA
    - RECHAZADA
  */
  const obtenerSolicitudes = async () => {
    try {
      const res = await fetch(`${API_URL}/solicitudes`)
      const data = await res.json()

      const lista = Array.isArray(data)
        ? data
        : data.solicitudes || []

      const resueltas = lista.filter(
        s =>
          s.estado === 'APROBADA' ||
          s.estado === 'RECHAZADA'
      )

      setSolicitudes(resueltas)

    } catch (error) {
      console.error('Error al obtener reportes:', error)

    } finally {
      setLoading(false)
    }
  }

  /*
    Obtiene la fecha que se usará para reportes.

    Se revisan varios campos posibles porque el backend
    puede devolver la fecha con diferentes nombres.
  */
  const obtenerFechaReporte = (solicitud) => {
    return (
      solicitud.fecha_resolucion ||
      solicitud.fecha_actualizacion ||
      solicitud.updated_at ||
      solicitud.fecha_solicitud ||
      solicitud.created_at
    )
  }

  /*
    Genera la lista filtrada de solicitudes.

    useMemo evita recalcular los filtros innecesariamente,
    a menos que cambien las solicitudes o los filtros.
  */
  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter((solicitud) => {
      const coincideEstado =
        estado === 'TODOS' ||
        solicitud.estado === estado

      const fechaValor = obtenerFechaReporte(solicitud)

      if (
        !fechaValor &&
        (mes !== 'TODOS' || anio !== 'TODOS')
      ) {
        return false
      }

      const fecha = fechaValor
        ? new Date(fechaValor)
        : null

      const coincideMes =
        mes === 'TODOS' ||
        (
          fecha &&
          fecha.getMonth() + 1 === Number(mes)
        )

      const coincideAnio =
        anio === 'TODOS' ||
        (
          fecha &&
          fecha.getFullYear() === Number(anio)
        )

      return (
        coincideEstado &&
        coincideMes &&
        coincideAnio
      )
    })
  }, [solicitudes, estado, mes, anio])

  /*
    Obtiene los años disponibles a partir de las fechas
    reales de las solicitudes cargadas.
  */
  const aniosDisponibles = useMemo(() => {
    const anios = solicitudes
      .map(s => obtenerFechaReporte(s))
      .filter(Boolean)
      .map(fecha => new Date(fecha).getFullYear())
      .filter(anio => !Number.isNaN(anio))

    return [...new Set(anios)]
      .sort((a, b) => b - a)
  }, [solicitudes])

  /*
    Limpia todos los filtros y vuelve a mostrar
    aprobadas y rechazadas de cualquier mes y año.
  */
  const limpiarFiltros = () => {
    setEstado('TODOS')
    setMes('TODOS')
    setAnio('TODOS')
  }

  /*
    Convierte una fecha en formato legible para México.
  */
  const formatearFecha = (valor) => {
    if (!valor) return '—'

    const fecha = new Date(valor)

    if (Number.isNaN(fecha.getTime())) {
      return '—'
    }

    return fecha.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="admin-reportes-page">

      {/* Encabezado del módulo */}
      <div className="admin-reportes-top">
        <h1>Reportes</h1>

        {/* Redirección al módulo de estadísticas */}
        <button
          className="btn-estadisticas"
          onClick={() => navigate('/admin/estadisticas')}
        >
          Ver estadísticas
        </button>
      </div>

      {/* Filtros de búsqueda */}
      <div className="reportes-filtros-card">

        <div className="filtro-grupo">
          <label>Filtrar por estado</label>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="TODOS">
              Aprobadas y Rechazadas
            </option>

            <option value="APROBADA">
              Aprobadas
            </option>

            <option value="RECHAZADA">
              Rechazadas
            </option>
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Mes</label>

          <select
            value={mes}
            onChange={(e) => setMes(e.target.value)}
          >
            <option value="TODOS">Todos</option>
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
            <option value="4">Abril</option>
            <option value="5">Mayo</option>
            <option value="6">Junio</option>
            <option value="7">Julio</option>
            <option value="8">Agosto</option>
            <option value="9">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Año</label>

          <select
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
          >
            <option value="TODOS">Todos</option>

            {aniosDisponibles.map((year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* El filtrado se aplica automáticamente al cambiar los select */}
        <button className="btn-filtrar">
          Filtrar
        </button>

        <button
          className="btn-limpiar"
          onClick={limpiarFiltros}
        >
          Limpiar
        </button>

        <button className="btn-pdf">
          Descargar PDF
        </button>

      </div>

      {/* Tabla de resultados */}
      <div className="reportes-tabla-card">
        <table className="reportes-tabla">

          <thead>
            <tr>
              <th>Embarcación</th>
              <th>Cliente</th>
              <th>Fecha de resolución</th>
              <th>Estado</th>
              <th>Motivo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="sin-datos">
                  Cargando reportes...
                </td>
              </tr>

            ) : solicitudesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="6" className="sin-datos">
                  No hay reportes para mostrar.
                </td>
              </tr>

            ) : (
              solicitudesFiltradas.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td>{solicitud.nombre_bote || '—'}</td>

                  <td>
                    {
                      solicitud.fullname ||
                      solicitud.cliente ||
                      '—'
                    }
                  </td>

                  <td>
                    {
                      formatearFecha(
                        obtenerFechaReporte(solicitud)
                      )
                    }
                  </td>

                  <td>
                    <span
                      className={
                        solicitud.estado === 'APROBADA'
                          ? 'badge aprobada'
                          : 'badge rechazada'
                      }
                    >
                      {
                        solicitud.estado === 'APROBADA'
                          ? 'Aprobada'
                          : 'Rechazada'
                      }
                    </span>
                  </td>

                  <td>
                    {
                      solicitud.estado === 'RECHAZADA'
                        ? solicitud.motivo_rechazo || 'Sin motivo'
                        : '—'
                    }
                  </td>

                  <td>
                    <button className="btn-detalle">
                      Ver detalle
                    </button>
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

export default AdminReportes