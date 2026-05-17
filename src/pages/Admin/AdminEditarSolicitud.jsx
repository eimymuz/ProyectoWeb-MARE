import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { fetchAuth } from '../../services/api'
import './styles/adminEditarSolicitud.css'
import Toast from '../../components/admin/Toast'



// Valida un campo individual y devuelve mensaje de error o vacío si es válido
const validarCampo = (name, value) => {
  const v = String(value).trim()

  switch (name) {
    case 'fullname':
      if (!v) return 'El nombre es obligatorio'
      if (v.length < 3) return 'Mínimo 3 caracteres'
      if (v.length > 80) return 'Máximo 80 caracteres'
      break
    case 'email':
      if (!v) return 'El correo es obligatorio'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Formato de correo inválido'
      break
    case 'telefono':
      if (!v) return 'El teléfono es obligatorio'
      if (!/^\+?[\d\s\-]{7,15}$/.test(v)) return 'Solo números, espacios o guiones'
      break
    case 'nombre_bote':
      if (!v) return 'El nombre es obligatorio'
      if (v.length < 2) return 'Mínimo 2 caracteres'
      if (v.length > 50) return 'Máximo 50 caracteres'
      break
    case 'tipo_barco':
      if (!v) return 'Selecciona el tipo'
      break
    case 'eslora':
    case 'manga':
    case 'calado':
      if (!v || parseFloat(v) <= 0) return 'Debe ser mayor a 0'
      break
    case 'fecha_llegada':
      if (!v) return 'La fecha de llegada es obligatoria'
      break
    case 'fecha_salida':
      if (!v) return 'La fecha de salida es obligatoria'
      break
    case 'comentario':
      if (v.length > 200) return 'Máximo 200 caracteres'
      break
  }
  return ''
}

function AdminEditarSolicitud() {

  const [exito, setExito] = useState(false)

  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()


  // Errores por campo y campos tocados para validación en tiempo real
  const [errores, setErrores] = useState({})
  const [tocados, setTocados] = useState({})

  const from = searchParams.get('from') || 'pendientes'

  const [form, setForm] = useState({
    fullname: '',
    email: '',
    telefono: '',
    nombre_bote: '',
    tipo_barco: '',
    eslora: '',
    manga: '',
    calado: '',
    fecha_llegada: '',
    fecha_salida: '',
    comentario: '',
    primera_entrada_mexico: false
  })

  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    obtenerSolicitud()
  }, [id])

  const obtenerSolicitud = async () => {
    try {
      const res = await fetchAuth(`/solicitudes/${id}`)
        const data = await res.json()

      if (data.ok) {
        setForm({
          fullname: data.solicitud.fullname || '',
          email: data.solicitud.email || '',
          telefono: data.solicitud.telefono || '',
          nombre_bote: data.solicitud.nombre_bote || '',
          tipo_barco: data.solicitud.tipo_barco || '',
          eslora: data.solicitud.eslora || '',
          manga: data.solicitud.manga || '',
          calado: data.solicitud.calado || '',
          fecha_llegada:
            data.solicitud.fecha_llegada?.slice(0, 10) || '',
          fecha_salida:
            data.solicitud.fecha_salida?.slice(0, 10) || '',
          comentario: data.solicitud.comentario || '',
          primera_entrada_mexico:
            Number(data.solicitud.primera_entrada_mexico) === 1
        })
      }
    } catch (error) {
      console.error(error)
      alert('Error al cargar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const nuevoValor = type === 'checkbox' ? checked : value

    setForm({ ...form, [name]: nuevoValor })

    // Valida en tiempo real si el campo ya fue tocado
    if (tocados[name]) {
      setErrores({ ...errores, [name]: validarCampo(name, nuevoValor) })
    }
  }

  // Marca el campo como tocado al salir y valida
  const handleBlur = (e) => {
    const { name, value } = e.target
    setTocados({ ...tocados, [name]: true })
    setErrores({ ...errores, [name]: validarCampo(name, value) })
  }

  const guardarCambios = async (e) => {
    e.preventDefault()

    // Valida todos los campos al guardar
    const campos = ['fullname', 'email', 'telefono', 'nombre_bote', 'tipo_barco',
                    'eslora', 'manga', 'calado', 'fecha_llegada', 'fecha_salida', 'comentario']

    const nuevosErrores = {}
    const nuevosTocados = {}

    campos.forEach(name => {
      nuevosErrores[name] = validarCampo(name, form[name])
      nuevosTocados[name] = true
    })

    // Valida que salida sea posterior a llegada
    if (form.fecha_llegada && form.fecha_salida) {
      if (new Date(form.fecha_salida) <= new Date(form.fecha_llegada)) {
        nuevosErrores.fecha_salida = 'Debe ser posterior a la llegada'
      }
    }

    setErrores(nuevosErrores)
    setTocados(nuevosTocados)

    if (Object.values(nuevosErrores).some(e => e)) return

    try {
      setGuardando(true)

      const res = await fetchAuth(`/solicitudes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          primera_entrada_mexico: form.primera_entrada_mexico ? 1 : 0
        })
      })

      const data = await res.json()

      if (!data.ok) {
        alert(data.error || 'No se pudieron guardar los cambios')
        return
      }

      setExito(true)
    } catch (error) {
      console.error(error)
      alert('Error de conexión con el servidor')
    } finally {
      setGuardando(false)
    }
  }

  // Navega de regreso después de mostrar el toast de éxito || aqui mismo de modifica el tiempo
  useEffect(() => {
      if (!exito) return
      const timer = setTimeout(() => navigate(`/admin/${from}`), 200)
      return () => clearTimeout(timer)
  }, [exito])


  // Clase CSS según estado de validación del campo
  const claseCampo = (name) => {
    if (!tocados[name]) return ''
    return errores[name] ? 'input-error' : 'input-valido'
  }

  if (loading) {
    return <p>Cargando solicitud...</p>
  }


  




  return (
    <form className="admin-editar-page" onSubmit={guardarCambios}>
      <div className="admin-editar-top">
        <h2>Editar solicitud #{id}</h2>

        <button
          type="button"
          className="btn-volver"
          onClick={() => navigate(`/admin/${from}`)}
        >
          ← Volver
        </button>
      </div>

      {/* DATOS DEL CLIENTE */}
            <section className="editar-card">
              <h3>Datos del cliente</h3>

              <div className="editar-grid editar-grid-2">
                <div className="editar-field">
                  <label>Nombre completo</label>
                  <input
                    name="fullname"
                    value={form.fullname}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={claseCampo('fullname')}
                  />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                      {errores.fullname && tocados.fullname
                        ? <span className="editar-error">{errores.fullname}</span>
                        : <span />
                      }
                      <span style={{ fontSize: '11px', color: form.fullname?.length > 80 ? '#c0392b' : '#aaa' }}>
                        {form.fullname?.length || 0}/80
                      </span>
                    </div>
                </div>

                <div className="editar-field">
                  <label>Correo electrónico</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={claseCampo('email')}
                    type="email"
                  />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                      {errores.email && tocados.email
                        ? <span className="editar-error">{errores.email}</span>
                        : <span />
                      }
                      <span style={{ fontSize: '11px', color: form.email?.length > 100 ? '#c0392b' : '#aaa' }}>
                        {form.email?.length || 0}/100
                      </span>
                    </div>
                </div>

                <div className="editar-field">
                  <label>Teléfono</label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={claseCampo('telefono')}
                    type="tel"
                    onKeyDown={(e) => {
                      const permitidos = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '+', '-', ' ']
                      if (!permitidos.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault()
                    }}
                  />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                        {errores.telefono && tocados.telefono
                          ? <span className="editar-error">{errores.telefono}</span>
                          : <span />
                        }
                        <span style={{ fontSize: '11px', color: form.telefono?.length > 15 ? '#c0392b' : '#aaa' }}>
                          {form.telefono?.length || 0}/15
                        </span>
                      </div>
                </div>
              </div>
            </section>

      {/* DATOS DE LA EMBARCACIÓN */}
      <section className="editar-card">
        <h3>Datos de la embarcación</h3>

        <div className="editar-grid editar-grid-2">
          <div className="editar-field">
            <label>Nombre de la embarcación</label>
            <input
              name="nombre_bote"
              value={form.nombre_bote}
              onChange={handleChange}
              onBlur={handleBlur}
              className={claseCampo('nombre_bote')}
            />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                  {errores.nombre_bote && tocados.nombre_bote
                    ? <span className="editar-error">{errores.nombre_bote}</span>
                    : <span />
                  }
                  <span style={{ fontSize: '11px', color: form.nombre_bote?.length > 50 ? '#c0392b' : '#aaa' }}>
                    {form.nombre_bote?.length || 0}/50
                  </span>
                </div>
          </div>

          <div className="editar-field">
            <label>Tipo de embarcación</label>
            <select
              name="tipo_barco"
              value={form.tipo_barco}
              onChange={handleChange}
              onBlur={handleBlur}
              className={claseCampo('tipo_barco')}
            >
              <option value="">Seleccione una opción</option>
              <option value="YATE">Yate</option>
              <option value="VELERO">Velero</option>
              <option value="LANCHA">Lancha</option>
              <option value="CATAMARÁN">Catamarán</option>
              <option value="MOTONAVE">Motonave</option>
            </select>
            {errores.tipo_barco && tocados.tipo_barco && (
              <span className="editar-error">{errores.tipo_barco}</span>
            )}
          </div>
        </div>

        <div className="editar-grid editar-grid-3">
          {['eslora', 'manga', 'calado'].map(campo => (
            <div className="editar-field" key={campo}>
              <label>{campo.charAt(0).toUpperCase() + campo.slice(1)} (m)</label>
              <input
                name={campo}
                value={form[campo]}
                onChange={handleChange}
                onBlur={handleBlur}
                className={claseCampo(campo)}
                type="number"
                step="0.01"
                min="0.01"
                onKeyDown={(e) => {
                  const permitidos = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '.', ',']
                  if (!permitidos.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault()
                }}
              />
              {errores[campo] && tocados[campo] && (
                <span className="editar-error">{errores[campo]}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* DATOS DE LA SOLICITUD */}
      <section className="editar-card">
        <h3>Datos de la solicitud</h3>

        <div className="editar-grid editar-grid-2">
          <div className="editar-field">
            <label>Fecha de llegada</label>
            <input
              type="date"
              name="fecha_llegada"
              value={form.fecha_llegada}
              onChange={handleChange}
              onBlur={handleBlur}
              className={claseCampo('fecha_llegada')}
              min={new Date().toISOString().slice(0, 10)}
            />
            {errores.fecha_llegada && tocados.fecha_llegada && (
              <span className="editar-error">{errores.fecha_llegada}</span>
            )}
          </div>

          <div className="editar-field">
            <label>Fecha de salida</label>
            <input
              type="date"
              name="fecha_salida"
              value={form.fecha_salida}
              onChange={handleChange}
              onBlur={handleBlur}
              className={claseCampo('fecha_salida')}
              min={form.fecha_llegada || new Date().toISOString().slice(0, 10)}
            />
            {errores.fecha_salida && tocados.fecha_salida && (
              <span className="editar-error">{errores.fecha_salida}</span>
            )}
          </div>
        </div>

        <div className="editar-field">
          <label>Comentario</label>
          <textarea
            name="comentario"
            value={form.comentario}
            onChange={handleChange}
            onBlur={handleBlur}
            className={claseCampo('comentario')}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {errores.comentario && tocados.comentario && (
              <span className="editar-error">{errores.comentario}</span>
            )}
            <span style={{ fontSize: '11px', color: form.comentario?.length > 200 ? '#c0392b' : '#aaa', marginLeft: 'auto' }}>
              {form.comentario?.length || 0}/200
            </span>
          </div>
        </div>

        <label className="editar-check">
          <input
            type="checkbox"
            name="primera_entrada_mexico"
            checked={form.primera_entrada_mexico}
            onChange={handleChange}
          />
          Primera entrada a México / First entry to Mexico
        </label>
      </section>

      <div className="editar-actions">
        <button type="submit" className="btn-guardar" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>

        <button
          type="button"
          className="btn-cancelar"
          onClick={() => navigate(`/admin/${from}`)}
        >
          Cancelar
        </button>
      </div>


      {exito && (
      <Toast
        mensaje="Cambios guardados correctamente"
        tipo="success"
        onClose={() => setExito(false)}
      />
    )}

    </form>
  )
}

export default AdminEditarSolicitud