import { useEffect, useState, useRef, useCallback } from 'react'
import { fetchAuth } from '../../services/api'
import './AdminMapa.css'

// Colores del mapa según estado del espacio
const COLORES = {
  libre:   '#e8edf2',  // gris claro
  ocupado: '#f87171',  // rojo
  ideal:   '#4ade80',  // verde
  posible: '#fb923c',  // naranja
  nocabe:  '#94a3b8',  // gris oscuro
  pasillo: '#c9a84c',  // dorado
}

// Página del mapa operativo de la marina.
// Muestra todos los muelles y espacios en un canvas SVG interactivo.
// Permite visualizar ocupación y asignar solicitudes aprobadas a espacios.
function AdminMapa() {
  // canvasRef — el div contenedor del SVG (para wheel y popup)
  const canvasRef = useRef(null)

  // Datos del mapa
  const [muelles, setMuelles] = useState([])
  const [espacios, setEspacios] = useState([])
  const [zonas, setZonas] = useState([])
  const [etiquetas, setEtiquetas] = useState([])
  const [solicitudesAprobadas, setSolicitudesAprobadas] = useState([])

  const [loading, setLoading] = useState(true)

  // Espacio seleccionado al hacer clic
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null)

  // Popup flotante al hacer clic en espacio ocupado
  const [popup, setPopup] = useState(null)

  // Solicitud seleccionada para asignar
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null)

  // Zoom y pan del canvas
  const [transform, setTransform] = useState({ x: 50, y: 20, scale: 1 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Modal de asignación
  const [modalAsignar, setModalAsignar] = useState(false)
  const [espacioAsignar, setEspacioAsignar] = useState(null)
  const [guardando, setGuardando] = useState(false)

  // Manejo del zoom con rueda del mouse — centrado en el cursor
  const handleWheel = useCallback((e) => {
    e.preventDefault()

    const factor = e.deltaY < 0 ? 1.1 : 0.9
    const rect = canvasRef.current.getBoundingClientRect()

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setTransform(t => {
      const newScale = Math.min(Math.max(t.scale * factor, 0.1), 3)
      const newX = mouseX - (mouseX - t.x) * (newScale / t.scale)
      const newY = mouseY - (mouseY - t.y) * (newScale / t.scale)
      return { x: newX, y: newY, scale: newScale }
    })
  }, [])

  // Carga los datos del mapa al montar el componente
  useEffect(() => {
    cargarMapa()
    cargarSolicitudesAprobadas()
  }, [])

    // Registra el wheel como non-passive para evitar scroll de página
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      // Bloquea el scroll con rueda y con botón del medio
      const bloquearScroll = (e) => e.preventDefault()

      canvas.addEventListener('wheel', handleWheel, { passive: false })
      canvas.addEventListener('mousedown', (e) => {
        if (e.button === 1) e.preventDefault() // botón del medio
      })

      return () => {
        canvas.removeEventListener('wheel', handleWheel)
        canvas.removeEventListener('mousedown', bloquearScroll)
      }
    }, [handleWheel, loading])

  const cargarMapa = async () => {
    try {
      setLoading(true)
      const res = await fetchAuth('/mapa')
      const data = await res.json()

      if (data.ok) {
        setMuelles(data.muelles)
        setEspacios(data.espacios)
        setZonas(data.zonas)
        setEtiquetas(data.etiquetas)
      }
    } catch (error) {
      console.error('Error al cargar mapa:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarSolicitudesAprobadas = async () => {
    try {
      const res = await fetchAuth('/mapa/solicitudes-aprobadas')
      const data = await res.json()
      if (data.ok) setSolicitudesAprobadas(data.solicitudes)
    } catch (error) {
      console.error('Error al cargar solicitudes:', error)
    }
  }

  // Determina el color de un espacio según su estado y la solicitud seleccionada
  const colorEspacio = (espacio) => {
    if (espacio.es_pasillo) return COLORES.pasillo
    if (espacio.asignacion_id) return COLORES.ocupado
    if (!solicitudSeleccionada) return COLORES.libre

    const eslora = parseFloat(solicitudSeleccionada.eslora)
    const manga  = parseFloat(solicitudSeleccionada.manga)
    const ancho  = parseFloat(espacio.ancho)
    const alto   = parseFloat(espacio.alto)

    return eslora <= alto && manga <= ancho ? COLORES.ideal : COLORES.nocabe
  }

  // Convierte puntos del polígono de zona de tierra a string SVG
  const puntosToSVG = (puntosStr) => {
    try {
      const puntos = JSON.parse(puntosStr)
      return puntos.map(p => `${p.x},${p.y}`).join(' ')
    } catch {
      return ''
    }
  }

  // Manejo del drag (mover el mapa arrastrando)
  const handleMouseDown = (e) => {
    if (e.target.closest('.espacio-rect')) return
    setDragging(true)
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y })
  }

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return
    setTransform(t => ({
      ...t,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }))
  }, [dragging, dragStart])

  const handleMouseUp = () => setDragging(false)

  // Clic en un espacio del mapa
  const handleClickEspacio = (espacio, e) => {
    e.stopPropagation()
    setEspacioSeleccionado(espacio)

    if (espacio.es_pasillo) return

    if (espacio.asignacion_id) {
      // Espacio ocupado — muestra popup con info del barco
      const rect = canvasRef.current.getBoundingClientRect()
      setPopup({
        espacio,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    } else if (solicitudSeleccionada) {
      // Espacio libre con solicitud seleccionada — abre modal de asignación
      setEspacioAsignar(espacio)
      setModalAsignar(true)
    }
  }

  // Confirmar asignación de espacio a solicitud
  const handleAsignar = async () => {
    if (!espacioAsignar || !solicitudSeleccionada) return

    try {
      setGuardando(true)

      const res = await fetchAuth('/mapa/asignar', {
        method: 'POST',
        body: JSON.stringify({
          solicitud_id: solicitudSeleccionada.id,
          espacio_id: espacioAsignar.id,
          fecha_inicio: solicitudSeleccionada.fecha_llegada,
          fecha_fin: solicitudSeleccionada.fecha_salida
        })
      })

      const data = await res.json()

      if (!data.ok) {
        alert(data.error || 'Error al asignar')
        return
      }

      setModalAsignar(false)
      setEspacioAsignar(null)
      setSolicitudSeleccionada(null)
      setPopup(null)
      cargarMapa()
      cargarSolicitudesAprobadas()
    } catch (error) {
      alert('Error de conexión')
    } finally {
      setGuardando(false)
    }
  }

  // Liberar un espacio desactivando su asignación
  const handleDesasignar = async (asignacionId) => {
    if (!confirm('¿Liberar este espacio?')) return

    try {
      const res = await fetchAuth(`/mapa/asignacion/${asignacionId}/desactivar`, {
        method: 'PATCH'
      })

      const data = await res.json()

      if (!data.ok) {
        alert(data.error)
        return
      }

      setPopup(null)
      setEspacioSeleccionado(null)
      cargarMapa()
      cargarSolicitudesAprobadas()
    } catch (error) {
      alert('Error de conexión')
    }
  }

  const resetZoom = () => setTransform({ x: 50, y: 20, scale: 1 })

  // Resumen de espacios para el footer
  const resumen = {
    ocupados: espacios.filter(e => !e.es_pasillo && e.asignacion_id).length,
    libres:   espacios.filter(e => !e.es_pasillo && !e.asignacion_id).length,
    ideales:  solicitudSeleccionada
      ? espacios.filter(e => {
          if (e.es_pasillo || e.asignacion_id) return false
          return parseFloat(solicitudSeleccionada.eslora) <= parseFloat(e.alto) &&
                 parseFloat(solicitudSeleccionada.manga)  <= parseFloat(e.ancho)
        }).length
      : 0
  }

  if (loading) return <div className="mapa-loading">Cargando mapa...</div>

  return (
    <div className="admin-mapa-page">

      {/* HEADER */}
      <div className="mapa-header">
        <h2>Mapa Operativo</h2>
        <div className="mapa-header-right">
          <button type="button" className="mapa-reset-btn" onClick={resetZoom}>
            ↺ Reset
          </button>
          <span className="mapa-zoom-label">
            {Math.round(transform.scale * 100)}%
          </span>
        </div>
      </div>

      <div className="mapa-layout">

        {/* PANEL IZQUIERDO */}
        <div className="mapa-sidebar">

          <div className="mapa-panel">
            <div className="mapa-panel-label">ESPACIO</div>

            {espacioSeleccionado && !espacioSeleccionado.es_pasillo ? (
              <>
                <div className="mapa-panel-row">
                  <span>MUELLE</span>
                  <strong>
                    {muelles.find(m => m.id === espacioSeleccionado.muelle_id)?.nombre || '—'}
                  </strong>
                </div>
                <div className="mapa-panel-row">
                  <span>ESPACIO</span>
                  <strong>{espacioSeleccionado.numero || '—'}</strong>
                </div>
                <div className="mapa-panel-row">
                  <span>TAMAÑO</span>
                  <strong>{espacioSeleccionado.ancho}m × {espacioSeleccionado.alto}m</strong>
                </div>
                <div className="mapa-panel-row">
                  <span>ESTADO</span>
                  <strong className={espacioSeleccionado.asignacion_id ? 'estado-ocupado' : 'estado-libre'}>
                    {espacioSeleccionado.asignacion_id ? 'Ocupado' : 'Libre'}
                  </strong>
                </div>
              </>
            ) : (
              <p className="mapa-panel-hint">Haz clic en un espacio para ver su información.</p>
            )}
          </div>

          <div className="mapa-panel">
            <div className="mapa-panel-label">SOLICITUD</div>

            {solicitudesAprobadas.length === 0 ? (
              <p className="mapa-panel-hint">No hay solicitudes aprobadas sin asignar.</p>
            ) : (
              <select
                className="mapa-solicitud-select"
                value={solicitudSeleccionada?.id || ''}
                onChange={(e) => {
                  const sol = solicitudesAprobadas.find(s => s.id === Number(e.target.value))
                  setSolicitudSeleccionada(sol || null)
                }}
              >
                <option value="">Selecciona una solicitud</option>
                {solicitudesAprobadas.map(s => (
                  <option key={s.id} value={s.id}>
                    #{s.id} — {s.nombre_bote} ({s.fullname})
                  </option>
                ))}
              </select>
            )}

            {solicitudSeleccionada && (
              <div className="mapa-solicitud-info">
                <div className="mapa-panel-row">
                  <span>Embarcación</span>
                  <strong>{solicitudSeleccionada.nombre_bote}</strong>
                </div>
                <div className="mapa-panel-row">
                  <span>Eslora</span>
                  <strong>{solicitudSeleccionada.eslora}m</strong>
                </div>
                <div className="mapa-panel-row">
                  <span>Manga</span>
                  <strong>{solicitudSeleccionada.manga}m</strong>
                </div>
                <div className="mapa-panel-row">
                  <span>Llegada</span>
                  <strong>{new Date(solicitudSeleccionada.fecha_llegada).toLocaleDateString('es-MX')}</strong>
                </div>
                <p className="mapa-panel-hint">
                  Haz clic en un espacio verde para asignar.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* CANVAS SVG */}
        <div
          className="mapa-canvas"
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => setPopup(null)}
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        >
          <svg
            width="100%"
            height="100%"
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: '0 0',
              transition: 'none'
            }}
            viewBox="-1700 -800 3400 2100"
          >
            {/* FONDO DE AGUA */}
            <rect x="-1700" y="-800" width="3400" height="2100" fill="#a8d8ea" />

            {/* ZONAS DE TIERRA */}
            {zonas.map(zona => (
              <polygon
                key={zona.id}
                points={puntosToSVG(zona.puntos)}
                fill={zona.color}
              />
            ))}

            {/* ESPACIOS */}
            {espacios.map(espacio => {
              const color = colorEspacio(espacio)
              const cx = parseFloat(espacio.pos_x) + parseFloat(espacio.ancho) / 2
              const cy = parseFloat(espacio.pos_y) + parseFloat(espacio.alto) / 2

              return (
                <g
                  key={espacio.id}
                  className="espacio-rect"
                  transform={`rotate(${espacio.rotacion}, ${cx}, ${cy})`}
                  onClick={(e) => handleClickEspacio(espacio, e)}
                  style={{ cursor: espacio.es_pasillo ? 'default' : 'pointer' }}
                >
                  <rect
                    x={espacio.pos_x}
                    y={espacio.pos_y}
                    width={espacio.ancho}
                    height={espacio.alto}
                    fill={color}
                    stroke={espacio.es_pasillo ? 'none' : '#fff'}
                    strokeWidth="1"
                    rx="1"
                  />

                  {!espacio.es_pasillo && espacio.numero && (
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fontWeight="700"
                      fill={color === COLORES.ocupado ? 'white' : '#1a2a3a'}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {espacio.numero}
                    </text>
                  )}
                </g>
              )
            })}

            {/* ETIQUETAS DE MUELLE */}
            {etiquetas.map(etiqueta => (
              <text
                key={etiqueta.id}
                x={etiqueta.pos_x}
                y={etiqueta.pos_y}
                textAnchor="middle"
                fontSize={etiqueta.tamanio}
                fill={etiqueta.color}
                fontWeight="700"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {etiqueta.texto}
              </text>
            ))}
          </svg>

          {/* POPUP al hacer clic en espacio ocupado */}
          {popup && (
            <div
              className="mapa-popup"
              style={{
                left: Math.min(popup.x, canvasRef.current?.clientWidth - 280) + 'px',
                top: Math.min(popup.y, canvasRef.current?.clientHeight - 250) + 'px'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="mapa-popup-header">
                <div>
                  <strong>Espacio {popup.espacio.numero}</strong>
                  <span>{muelles.find(m => m.id === popup.espacio.muelle_id)?.nombre}</span>
                </div>
                <button type="button" onClick={() => setPopup(null)}>×</button>
              </div>

              <div className="mapa-popup-body">
                <div className="mapa-popup-row">
                  <span>Embarcación</span>
                  <strong>{popup.espacio.nombre_bote}</strong>
                </div>
                <div className="mapa-popup-row">
                  <span>Cliente</span>
                  <strong>{popup.espacio.fullname}</strong>
                </div>
                <div className="mapa-popup-row">
                  <span>Llegada</span>
                  <strong>{new Date(popup.espacio.fecha_inicio).toLocaleDateString('es-MX')}</strong>
                </div>
                <div className="mapa-popup-row">
                  <span>Salida</span>
                  <strong>{new Date(popup.espacio.fecha_fin).toLocaleDateString('es-MX')}</strong>
                </div>
              </div>

              <div className="mapa-popup-footer">
                <button
                  type="button"
                  className="btn-liberar"
                  onClick={() => handleDesasignar(popup.espacio.asignacion_id)}
                >
                  Liberar
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* LEYENDA Y RESUMEN */}
      <div className="mapa-footer">

        <div className="mapa-leyenda">
          <span className="mapa-footer-label">ESTADOS</span>
          <div className="leyenda-items">
            <div className="leyenda-item">
              <div className="leyenda-dot" style={{ background: COLORES.ideal }} />
              Ideal
            </div>
            <div className="leyenda-item">
              <div className="leyenda-dot" style={{ background: COLORES.ocupado }} />
              Ocupado
            </div>
            <div className="leyenda-item">
              <div className="leyenda-dot" style={{ background: COLORES.libre }} />
              Libre
            </div>
            <div className="leyenda-item">
              <div className="leyenda-dot" style={{ background: COLORES.nocabe }} />
              No cabe
            </div>
            <div className="leyenda-item">
              <div className="leyenda-dot" style={{ background: COLORES.pasillo }} />
              Pasillo
            </div>
          </div>
        </div>

        <div className="mapa-resumen">
          <span className="mapa-footer-label">RESUMEN</span>
          <div className="resumen-items">
            <span className="resumen-ideal">{resumen.ideales} ideales</span>
            <span className="resumen-ocupado">{resumen.ocupados} ocupados</span>
            <span className="resumen-libre">{resumen.libres} libres</span>
          </div>
        </div>

        <div className="mapa-atajos">
          <span className="mapa-footer-label">ATAJOS</span>
          <div className="atajos-items">
            <span><kbd>Rueda</kbd> Zoom in/out</span>
            <span><kbd>Space + ✥</kbd> Mover mapa</span>
          </div>
        </div>

      </div>

      {/* MODAL DE CONFIRMACIÓN DE ASIGNACIÓN */}
      {modalAsignar && espacioAsignar && solicitudSeleccionada && (
        <div className="mapa-modal-overlay" onClick={() => setModalAsignar(false)}>
          <div className="mapa-modal" onClick={e => e.stopPropagation()}>
            <h3>Confirmar asignación</h3>

            <div className="mapa-modal-info">
              <div className="mapa-panel-row">
                <span>Embarcación</span>
                <strong>{solicitudSeleccionada.nombre_bote}</strong>
              </div>
              <div className="mapa-panel-row">
                <span>Cliente</span>
                <strong>{solicitudSeleccionada.fullname}</strong>
              </div>
              <div className="mapa-panel-row">
                <span>Espacio</span>
                <strong>
                  {espacioAsignar.numero} — Muelle {muelles.find(m => m.id === espacioAsignar.muelle_id)?.nombre}
                </strong>
              </div>
              <div className="mapa-panel-row">
                <span>Fechas</span>
                <strong>
                  {new Date(solicitudSeleccionada.fecha_llegada).toLocaleDateString('es-MX')} →{' '}
                  {new Date(solicitudSeleccionada.fecha_salida).toLocaleDateString('es-MX')}
                </strong>
              </div>
            </div>

            <div className="mapa-modal-actions">
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => setModalAsignar(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-guardar"
                onClick={handleAsignar}
                disabled={guardando}
              >
                {guardando ? 'Asignando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminMapa