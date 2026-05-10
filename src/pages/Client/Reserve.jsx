import '../../styles/reserve.css'

function Reserve({ onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="popup-header">
          <div>
            <h2>Solicitud de ingreso a marina</h2>

            <p>
              Complete el formulario y le contactaremos a la brevedad
            </p>
          </div>

          <button
            type="button"
            className="popup-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="popup-body">

          <form className="reserve-form">

            {/* SOLICITANTE */}
            <div className="section-label">
              Solicitante
            </div>

            <div className="form-row">

              <div className="form-group">
                <label>
                  Nombre completo
                </label>

                <input
                  type="text"
                  placeholder="Juan García"
                />
              </div>

              <div className="form-group">
                <label>
                  Teléfono
                </label>

                <input
                  type="text"
                  placeholder="+52 312 000 0000"
                />
              </div>

            </div>

            <div className="form-group">
              <label>
                Correo electrónico
              </label>

              <input
                type="email"
                placeholder="correo@ejemplo.com"
              />

              <p className="hint">
                Recibirá la confirmación en este correo
              </p>
            </div>

            {/* EMBARCACIÓN */}
            <div className="section-label">
              Embarcación
            </div>

            <div className="form-row">

              <div className="form-group">
                <label>Nombre</label>

                <input
                  type="text"
                  placeholder="Marea Alta"
                />
              </div>

              <div className="form-group">
                <label>Tipo</label>

                <select>
                  <option>Seleccione</option>
                  <option>Yate</option>
                  <option>Velero</option>
                  <option>Lancha</option>
                </select>
              </div>

            </div>

            <div className="form-row-3">

              <div className="form-group">
                <label>Eslora (m)</label>

                <input
                  type="number"
                  placeholder="12.50"
                />

                <p className="hint">Length</p>
              </div>

              <div className="form-group">
                <label>Manga (m)</label>

                <input
                  type="number"
                  placeholder="4.20"
                />

                <p className="hint">Beam</p>
              </div>

              <div className="form-group">
                <label>Calado (m)</label>

                <input
                  type="number"
                  placeholder="1.80"
                />

                <p className="hint">Draft</p>
              </div>

            </div>

            {/* ESTANCIA */}
            <div className="section-label">
              Estancia
            </div>

            <div className="form-row">

              <div className="form-group">
                <label>
                  Llegada / Arrival
                </label>

                <input type="date" />
              </div>

              <div className="form-group">
                <label>
                  Salida / Departure
                </label>

                <input type="date" />
              </div>

            </div>

            {/* CHECKBOX */}
            <div className="checkbox-row">

              <input type="checkbox" />

              <div className="checkbox-text">

                <label>
                  Primera entrada a México / First entry to Mexico
                </label>

                <small>
                  Marque si es la primera vez que su embarcación ingresa a aguas mexicanas
                </small>

              </div>

            </div>

            {/* INFO */}
            <div className="section-label">
              Información adicional
            </div>

            <div className="form-group">

              <label>
                Solicitudes especiales / Special requests
              </label>

              <textarea
                placeholder="Requerimientos especiales, servicios adicionales..."
              />

            </div>

          </form>

        </div>

        {/* FOOTER */}
        <div className="popup-footer">

          <button className="btn-submit">
            Enviar solicitud
          </button>

        </div>

      </div>
    </div>
  )
}

export default Reserve