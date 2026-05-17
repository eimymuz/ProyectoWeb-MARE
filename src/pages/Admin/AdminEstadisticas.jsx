import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LabelList
} from 'recharts'

import API_URL from '../../services/api'
import './styles/AdminEstadisticas.css'

function AdminEstadisticas() {
  const navigate = useNavigate()

  const [solicitudes, setSolicitudes] = useState([])
  const [mes, setMes] = useState('TODOS')
  const [anio, setAnio] = useState('TODOS')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    obtenerDatos()
  }, [])

  const obtenerDatos = async () => {
    try {
      const res = await fetch(`${API_URL}/solicitudes`)
      const data = await res.json()

      const lista = Array.isArray(data)
        ? data
        : data.solicitudes || []

      setSolicitudes(lista)
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const obtenerFecha = (solicitud) => {
    return (
      solicitud.fecha_solicitud ||
      solicitud.created_at ||
      solicitud.fecha_llegada ||
      solicitud.fecha_resolucion ||
      solicitud.updated_at
    )
  }

  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter((solicitud) => {
      const fechaValor = obtenerFecha(solicitud)

      if (!fechaValor) return false

      const fecha = new Date(fechaValor)

      if (Number.isNaN(fecha.getTime())) return false

      const coincideMes =
        mes === 'TODOS' ||
        fecha.getMonth() + 1 === Number(mes)

      const coincideAnio =
        anio === 'TODOS' ||
        fecha.getFullYear() === Number(anio)

      return coincideMes && coincideAnio
    })
  }, [solicitudes, mes, anio])

  const aniosDisponibles = useMemo(() => {
    const anios = solicitudes
      .map(s => obtenerFecha(s))
      .filter(Boolean)
      .map(fecha => new Date(fecha).getFullYear())
      .filter(year => !Number.isNaN(year))

    return [...new Set(anios)].sort((a, b) => b - a)
  }, [solicitudes])

  const limpiarFiltros = () => {
    setMes('TODOS')
    setAnio('TODOS')
  }

  const total = solicitudesFiltradas.length

  const aprobadas = solicitudesFiltradas.filter(
    s => s.estado === 'APROBADA'
  ).length

  const rechazadas = solicitudesFiltradas.filter(
    s => s.estado === 'RECHAZADA'
  ).length

  const seguimiento = solicitudesFiltradas.filter(
    s =>
      s.estado === 'PENDIENTE' ||
      s.estado === 'EN_ESPERA' ||
      s.estado === 'ASIGNADA'
  ).length

  const porcentajeAprobacion =
    total > 0
      ? ((aprobadas / total) * 100).toFixed(2)
      : '0.00'

  const meses = [
    'Ene', 'Feb', 'Mar', 'Abr',
    'May', 'Jun', 'Jul', 'Ago',
    'Sep', 'Oct', 'Nov', 'Dic'
  ]

  const solicitudesPorMes = meses.map((nombreMes, index) => {
    const totalMes = solicitudesFiltradas.filter((s) => {
      const fechaValor = obtenerFecha(s)
      const fecha = new Date(fechaValor)

      return !Number.isNaN(fecha.getTime()) &&
        fecha.getMonth() === index
    }).length

    return {
      mes: nombreMes,
      total: totalMes
    }
  })

  const mesActualIndex = new Date().getMonth()
  const mesAnteriorIndex = mesActualIndex === 0 ? 11 : mesActualIndex - 1

  const totalMesActual = solicitudesPorMes[mesActualIndex]?.total || 0
  const totalMesAnterior = solicitudesPorMes[mesAnteriorIndex]?.total || 0

  const crecimiento =
    totalMesAnterior > 0
      ? (((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100).toFixed(2)
      : totalMesActual > 0
        ? '100.00'
        : '0.00'

  const distribucion = [
    {
      name: 'Aprobadas',
      value: aprobadas,
      color: '#22c55e'
    },
    {
      name: 'En seguimiento',
      value: seguimiento,
      color: '#eab308'
    },
    {
      name: 'Rechazadas',
      value: rechazadas,
      color: '#ef4444'
    }
  ]

  const tiposMap = {}

  solicitudesFiltradas.forEach((s) => {
    const tipo = s.tipo_barco || 'Sin tipo'
    tiposMap[tipo] = (tiposMap[tipo] || 0) + 1
  })

  const tipos = Object.entries(tiposMap)
    .map(([tipo, total]) => ({
      tipo,
      total
    }))
    .sort((a, b) => b.total - a.total)

  const topMap = {}

  solicitudesFiltradas.forEach((s) => {
    const nombre = s.nombre_bote || 'Sin nombre'

    if (!topMap[nombre]) {
      topMap[nombre] = {
        nombre,
        tipo: s.tipo_barco || 'Sin tipo',
        total: 0
      }
    }

    topMap[nombre].total += 1
  })

  const topEmbarcaciones = Object.values(topMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  if (loading) {
    return (
      <div className="admin-estadisticas-page">
        <p>Cargando estadísticas...</p>
      </div>
    )
  }

  return (
    <div className="admin-estadisticas-page">

      <div className="estadisticas-header">
        <h1>Estadísticas</h1>

        <button
          className="btn-volver-reportes"
          onClick={() => navigate('/admin/reportes')}
        >
          Volver a reportes
        </button>
      </div>

      <div className="estadisticas-filtros-card">

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

      <div className="estadisticas-kpis">

        <div className="kpi-card blue">
          <h4>Total de solicitudes</h4>
          <span>{total}</span>
          <p>Registros acumulados</p>
        </div>

        <div className="kpi-card green">
          <h4>Aprobadas</h4>
          <span>{aprobadas}</span>
          <p>{porcentajeAprobacion}% de aprobación</p>
        </div>

        <div className="kpi-card red">
          <h4>Rechazadas</h4>
          <span>{rechazadas}</span>
          <p>Solicitudes no aceptadas</p>
        </div>

        <div className="kpi-card yellow">
          <h4>En seguimiento</h4>
          <span>{seguimiento}</span>
          <p>Pendientes, en espera o aprobadas</p>
        </div>

        <div className="kpi-card red">
          <h4>Crecimiento mensual</h4>
          <span className={Number(crecimiento) < 0 ? 'crecimiento negativo' : 'crecimiento positivo'}>
            {Number(crecimiento) < 0 ? '↓' : '↑'} {crecimiento}%
          </span>
          <p>
            Mes actual: {totalMesActual} | Mes anterior: {totalMesAnterior}
          </p>
        </div>

      </div>

      <div className="estadisticas-grid">

        <div className="estadistica-card large">
          <h3>Solicitudes por mes</h3>
          <p>Evolución mensual de las solicitudes registradas.</p>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={solicitudesPorMes}>
              <XAxis dataKey="mes" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="total"
                fill="#0f4c81"
                radius={[8, 8, 0, 0]}
              >
                <LabelList
                  dataKey="total"
                  position="top"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="estadistica-card">
          <h3>Distribución por estado</h3>
          <p>Comportamiento general del flujo de solicitudes.</p>

          <div className="donut-wrapper">
            <ResponsiveContainer width="100%" height={270}>
              <PieChart>
                <Pie
                  data={distribucion}
                  innerRadius={70}
                  outerRadius={115}
                  dataKey="value"
                >
                  {distribucion.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="donut-center">
              <strong>{total}</strong>
              <span>Total</span>
            </div>
          </div>

          <div className="estado-lista">
            {distribucion.map((item) => (
              <div
                className="estado-item"
                key={item.name}
              >
                <span
                  className="estado-punto"
                  style={{ background: item.color }}
                />
                <strong>{item.name}</strong>
                <b>{item.value}</b>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="estadisticas-grid">

        <div className="estadistica-card large">
          <h3>Estancias por tipo de embarcación</h3>
          <p>Clasificación de solicitudes según el tipo de embarcación.</p>

          <div className="tipos-list">
            {tipos.length === 0 ? (
              <p>No hay tipos registrados.</p>
            ) : (
              tipos.map((tipo, index) => (
                <div
                  className="tipo-item"
                  key={index}
                >
                  <div className="tipo-header">
                    <strong>{tipo.tipo}</strong>
                    <span>{tipo.total}</span>
                  </div>

                  <div className="tipo-bar">
                    <div
                      className="tipo-fill"
                      style={{
                        width: total > 0
                          ? `${(tipo.total / total) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="estadistica-card">
          <h3>Top embarcaciones</h3>
          <p>Embarcaciones con mayor número de solicitudes.</p>

          <div className="top-list">
            {topEmbarcaciones.length === 0 ? (
              <p>No hay embarcaciones registradas.</p>
            ) : (
              topEmbarcaciones.map((bote, index) => (
                <div
                  className="top-item"
                  key={bote.nombre}
                >
                  <div className="top-rank">
                    {index + 1}
                  </div>

                  <div className="top-info">
                    <div>
                      <strong>{bote.nombre}</strong>
                      <small>{bote.tipo}</small>
                    </div>

                    <span>{bote.total}x</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  )
}

export default AdminEstadisticas