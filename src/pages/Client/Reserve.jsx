import { useState } from 'react'
import API_URL from '../../services/api'
import '../../styles/reserve.css'

// Componente de popup para crear una nueva solicitud de marina.
// Se muestra desde ClientLayout y envía datos al backend.
function Reserve({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/solicitudes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'No se pudo enviar la solicitud')
        setLoading(false)
        return
      }

      setSuccess({
        id: data.solicitud_id,
        email: form.email
      })

      setLoading(false)
    } catch {
      setError('Error de conexión con el servidor')
      setLoading(false)
    }
  }

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>

        <div className="popup-header">
          <div>
            <h2>Solicitud de ingreso a marina</h2>
            <p>Complete el formulario y le contactaremos a la brevedad</p>
          </div>

          <button type="button" className="popup-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {success ? (
          <>
            <div className="popup-body">
              <div className="success-box">
                <div className="success-icon">✓</div>

                <h3>¡Solicitud enviada!</h3>

                <p>
                  Hemos recibido su solicitud. Le contactaremos al correo:
                </p>

                <strong>{success.email}</strong>

                <div className="success-num">
                  #{success.id}
                </div>

                <p className="hint">Guarde este número de referencia.</p>
              </div>
            </div>

            <div className="popup-footer">
              <button type="button" className="btn-submit" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="popup-body">

              {error && (
                <div className="errors-box">
                  {error}
                </div>
              )}

              <div className="section-label">Solicitante</div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Nombre completo <span className="required">*</span>
                  </label>
                  <input
                    name="fullname"
                    value={form.fullname}
                    onChange={handleChange}
                    type="text"
                    placeholder="Juan García"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Teléfono <span className="required">*</span>
                  </label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    type="tel"
                    placeholder="+52 312 000 0000"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Correo electrónico <span className="required">*</span>
                </label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="correo@ejemplo.com"
                  required
                />
                <p className="hint">Recibirá la confirmación en este correo</p>
              </div>

              <div className="section-label">Embarcación</div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Nombre <span className="required">*</span>
                  </label>
                  <input
                    name="nombre_bote"
                    value={form.nombre_bote}
                    onChange={handleChange}
                    type="text"
                    placeholder="Marea Alta"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Tipo <span className="required">*</span>
                  </label>
                  <select
                    name="tipo_barco"
                    value={form.tipo_barco}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione</option>
                    <option value="Yate">Yate</option>
                    <option value="Velero">Velero</option>
                    <option value="Lancha">Lancha</option>
                    <option value="Catamarán">Catamarán</option>
                  </select>
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label>
                    Eslora (m) <span className="required">*</span>
                  </label>
                  <input
                    name="eslora"
                    value={form.eslora}
                    onChange={handleChange}
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="12.50"
                    required
                  />
                  <p className="hint">Length</p>
                </div>

                <div className="form-group">
                  <label>
                    Manga (m) <span className="required">*</span>
                  </label>
                  <input
                    name="manga"
                    value={form.manga}
                    onChange={handleChange}
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="4.20"
                    required
                  />
                  <p className="hint">Beam</p>
                </div>

                <div className="form-group">
                  <label>
                    Calado (m) <span className="required">*</span>
                  </label>
                  <input
                    name="calado"
                    value={form.calado}
                    onChange={handleChange}
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="1.80"
                    required
                  />
                  <p className="hint">Draft</p>
                </div>
              </div>

              <div className="section-label">Estancia</div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Llegada / Arrival <span className="required">*</span>
                  </label>
                  <input
                    name="fecha_llegada"
                    value={form.fecha_llegada}
                    onChange={handleChange}
                    type="date"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Salida / Departure <span className="required">*</span>
                  </label>
                  <input
                    name="fecha_salida"
                    value={form.fecha_salida}
                    onChange={handleChange}
                    type="date"
                    required
                  />
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
                  placeholder="Requerimientos especiales, servicios adicionales..."
                />
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