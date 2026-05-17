import { useState } from 'react'
import API_URL from '../../services/api'
import '../../styles/reserve.css'

// Reglas de validación por campo
const REGLAS = {
  fullname:      { min: 3,  max: 80,  tipo: 'texto' },
  telefono:      { min: 7,  max: 15,  tipo: 'telefono' },
  email:         { min: 5,  max: 100, tipo: 'email' },
  nombre_bote:   { min: 2,  max: 50,  tipo: 'texto' },
  eslora:        { min: 0,  max: 200, tipo: 'numero' },
  manga:         { min: 0,  max: 50,  tipo: 'numero' },
  calado:        { min: 0,  max: 20,  tipo: 'numero' },
  comentario:    { min: 0,  max: 200, tipo: 'texto' },
}

// Valida un campo individual y devuelve mensaje de error o vacío si es válido
const validarCampo = (name, value) => {
  const regla = REGLAS[name]
  if (!regla) return ''

  const v = String(value).trim()

  if (regla.tipo === 'email') {
    if (!v) return 'El correo es obligatorio'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Formato de correo inválido'
  }

  if (regla.tipo === 'telefono') {
    if (!v) return 'El teléfono es obligatorio'
    if (!/^\+?[\d\s\-]{7,15}$/.test(v)) return 'Solo números, espacios o guiones'
  }

  if (regla.tipo === 'numero') {
    if (!v || parseFloat(v) <= 0) return 'Debe ser mayor a 0'
  }

  if (regla.min > 0 && v.length < regla.min)
    return `Mínimo ${regla.min} caracteres`

  if (v.length > regla.max)
    return `Máximo ${regla.max} caracteres`

  return ''
}

// Componente de formulario de solicitud de ingreso a marina
function Reserve({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [errorGeneral, setErrorGeneral] = useState('')

  const [form, setForm] = useState({
    fullname: '',
    telefono: '',
    email: '',
    nombre_bote: '',
    tipo_barco: '',
    eslora: '',
    manga: '',
    calado: '',
    fecha_llegada: '',
    fecha_salida: '',
    primera_entrada_mexico: false,
    comentario: ''
  })

  // Errores por campo — se muestran en tiempo real
  const [errores, setErrores] = useState({})

  // Campos que el usuario ya tocó — solo muestra error si ya interactuó
  const [tocados, setTocados] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const nuevoValor = type === 'checkbox' ? checked : value

    setForm({ ...form, [name]: nuevoValor })

    // Valida en tiempo real solo si el campo ya fue tocado
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorGeneral('')

    // Valida todos los campos al enviar
    const nuevosErrores = {}
    const nuevosTocados = {}

    Object.keys(REGLAS).forEach(name => {
      nuevosErrores[name] = validarCampo(name, form[name])
      nuevosTocados[name] = true
    })

    if (!form.tipo_barco) nuevosErrores.tipo_barco = 'Selecciona el tipo'
    if (!form.fecha_llegada) nuevosErrores.fecha_llegada = 'La fecha de llegada es obligatoria'
    if (!form.fecha_salida) nuevosErrores.fecha_salida = 'La fecha de salida es obligatoria'

    if (form.fecha_llegada && form.fecha_salida) {
      const llegada = new Date(form.fecha_llegada)
      const salida = new Date(form.fecha_salida)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      if (llegada < hoy)
        nuevosErrores.fecha_llegada = 'No puede ser en el pasado'
      if (salida <= llegada)
        nuevosErrores.fecha_salida = 'Debe ser posterior a la llegada'
    }

    setErrores(nuevosErrores)
    setTocados(nuevosTocados)

    // Si hay algún error no envía
    const hayErrores = Object.values(nuevosErrores).some(e => e)
    if (hayErrores) {
      setErrorGeneral('Corrige los errores antes de enviar')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/solicitudes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorGeneral(data.error || 'No se pudo enviar la solicitud')
        setLoading(false)
        return
      }

      setSuccess({ id: data.solicitud_id, email: form.email })
      setLoading(false)
    } catch {
      setErrorGeneral('Error de conexión con el servidor')
      setLoading(false)
    }
  }

  // Determina el estado visual de un campo
  const estadoCampo = (name) => {
    if (!tocados[name]) return ''
    return errores[name] ? 'campo-error' : 'campo-valido'
  }

  // Contador de caracteres para campos con límite
  const contador = (name) => {
    const regla = REGLAS[name]
    if (!regla || !regla.max) return null
    const len = String(form[name] || '').length
    const limite = regla.max
    return { len, limite, excede: len > limite }
  }

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>

        <div className="popup-header">
          <div>
            <h2>Solicitud de ingreso a marina</h2>
            <p>Complete el formulario y le contactaremos a la brevedad</p>
          </div>
          <button type="button" className="popup-close" onClick={onClose}>✕</button>
        </div>

        {success ? (
          <>
            <div className="popup-body">
              <div className="success-box">
                <div className="success-icon">✓</div>
                <h3>¡Solicitud enviada!</h3>
                <p>Hemos recibido su solicitud. Le contactaremos al correo:</p>
                <strong>{success.email}</strong>
                <div className="success-num">#{success.id}</div>
                <p className="hint">Guarde este número de referencia.</p>
              </div>
            </div>
            <div className="popup-footer">
              <button type="button" className="btn-submit" onClick={onClose}>Cerrar</button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="popup-body">

              {errorGeneral && (
                <div className="errors-box">{errorGeneral}</div>
              )}

              <div className="section-label">Solicitante</div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombre completo <span className="required">*</span></label>
                  <input
                    name="fullname"
                    value={form.fullname}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={estadoCampo('fullname')}
                    type="text"
                    placeholder="Juan García"
                  />
                  <div className="campo-meta">
                    {errores.fullname && tocados.fullname
                      ? <span className="campo-msg-error">{errores.fullname}</span>
                      : <span />
                    }
                    {(() => { const c = contador('fullname'); return c ? <span className={c.excede ? 'contador-excede' : 'contador'}>{c.len}/{c.limite}</span> : null })()}
                  </div>
                </div>

                <div className="form-group">
                  <label>Teléfono <span className="required">*</span></label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={estadoCampo('telefono')}
                    type="tel"
                    placeholder="+52 312 000 0000"
                    onKeyDown={(e) => {
                      // Permite: números, +, -, espacio, backspace, delete, flechas, tab
                      const permitidos = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '+', '-', ' ']
                      if (!permitidos.includes(e.key) && !/^\d$/.test(e.key)) {
                        e.preventDefault()
                      }
                    }}
                  />
                  <div className="campo-meta">
                    {errores.telefono && tocados.telefono
                      ? <span className="campo-msg-error">{errores.telefono}</span>
                      : <span />
                    }
                    {(() => { const c = contador('telefono'); return c ? <span className={c.excede ? 'contador-excede' : 'contador'}>{c.len}/{c.limite}</span> : null })()}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Correo electrónico <span className="required">*</span></label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={estadoCampo('email')}
                  type="email"
                  placeholder="correo@ejemplo.com"
                />
                <div className="campo-meta">
                  {errores.email && tocados.email
                    ? <span className="campo-msg-error">{errores.email}</span>
                    : <span className="hint">Recibirá la confirmación en este correo</span>
                  }
                </div>
              </div>

              <div className="section-label">Embarcación</div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombre <span className="required">*</span></label>
                  <input
                    name="nombre_bote"
                    value={form.nombre_bote}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={estadoCampo('nombre_bote')}
                    type="text"
                    placeholder="Marea Alta"
                  />
                  <div className="campo-meta">
                    {errores.nombre_bote && tocados.nombre_bote
                      ? <span className="campo-msg-error">{errores.nombre_bote}</span>
                      : <span />
                    }
                    {(() => { const c = contador('nombre_bote'); return c ? <span className={c.excede ? 'contador-excede' : 'contador'}>{c.len}/{c.limite}</span> : null })()}
                  </div>
                </div>

                <div className="form-group">
                  <label>Tipo <span className="required">*</span></label>
                  <select
                    name="tipo_barco"
                    value={form.tipo_barco}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={estadoCampo('tipo_barco')}
                  >
                    <option value="">Seleccione</option>
                    <option value="Yate">Yate</option>
                    <option value="Velero">Velero</option>
                    <option value="Lancha">Lancha</option>
                    <option value="Catamarán">Catamarán</option>
                    <option value="Motonave">Motonave</option>
                  </select>
                  {errores.tipo_barco && tocados.tipo_barco && (
                    <span className="campo-msg-error">{errores.tipo_barco}</span>
                  )}
                </div>
              </div>

              <div className="form-row-3">
                {['eslora', 'manga', 'calado'].map((campo, i) => (
                  <div className="form-group" key={campo}>
                    <label>
                      {campo.charAt(0).toUpperCase() + campo.slice(1)} (m) <span className="required">*</span>
                    </label>
                    <input
                      name={campo}
                      value={form[campo]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={estadoCampo(campo)}
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder={['12.50', '4.20', '1.80'][i]}
                    />
                    <div className="campo-meta">
                      {errores[campo] && tocados[campo]
                        ? <span className="campo-msg-error">{errores[campo]}</span>
                        : <span className="hint">{['Length', 'Beam', 'Draft'][i]}</span>
                      }
                    </div>
                  </div>
                ))}
              </div>

              <div className="section-label">Estancia</div>

              <div className="form-row">
                <div className="form-group">
                  <label>Llegada / Arrival <span className="required">*</span></label>
                  <input
                    name="fecha_llegada"
                    value={form.fecha_llegada}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={estadoCampo('fecha_llegada')}
                    type="date"
                    min={form.fecha_llegada || new Date().toISOString().slice(0, 10)}
                  />
                  {errores.fecha_llegada && tocados.fecha_llegada && (
                    <span className="campo-msg-error">{errores.fecha_llegada}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Salida / Departure <span className="required">*</span></label>
                  <input
                    name="fecha_salida"
                    value={form.fecha_salida}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={estadoCampo('fecha_salida')}
                    type="date"
                    min={form.fecha_llegada || new Date().toISOString().slice(0, 10)}
                  />
                  {errores.fecha_salida && tocados.fecha_salida && (
                    <span className="campo-msg-error">{errores.fecha_salida}</span>
                  )}
                </div>
              </div>

              <div className="checkbox-row">
                <input
                  name="primera_entrada_mexico"
                  checked={form.primera_entrada_mexico}
                  onChange={handleChange}
                  type="checkbox"
                  id="primeraEntrada"
                />
                <div className="checkbox-text">
                  <label htmlFor="primeraEntrada">
                    Primera entrada a México / First entry to Mexico
                  </label>
                  <small>
                    Marque si es la primera vez que su embarcación ingresa a aguas mexicanas
                  </small>
                </div>
              </div>

              <div className="section-label">Información adicional</div>

              <div className="form-group">
                <label>Solicitudes especiales / Special requests</label>
                <textarea
                  name="comentario"
                  value={form.comentario}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={estadoCampo('comentario')}
                  placeholder="Requerimientos especiales, servicios adicionales..."
                />
                <div className="campo-meta">
                  {errores.comentario && tocados.comentario
                    ? <span className="campo-msg-error">{errores.comentario}</span>
                    : <span />
                  }
                  {(() => { const c = contador('comentario'); return c ? <span className={c.excede ? 'contador-excede' : 'contador'}>{c.len}/{c.limite}</span> : null })()}
                </div>
              </div>

            </div>

            <div className="popup-footer">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}

export default Reserve