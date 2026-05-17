import './styles/AdminInicio.css'

function InicioAdmin() {
  return (
    <div className="inicio-admin-page">

      <div className="inicio-top-grid">

        <div className="inicio-card ocupacion-card">
          <div className="circle-progress">
            <span>12%</span>
          </div>

          <h3>Ocupación</h3>
          <p>esta semana</p>

          <div className="ocupacion-info">
            <div>
              <strong>183</strong>
              <span>LIBRES</span>
            </div>

            <div>
              <strong>24</strong>
              <span>OCUPADOS</span>
            </div>
          </div>
        </div>

        <div className="inicio-card clima-card">
          <div className="clima-content">

            <div className="clima-icon">
              ☀️
            </div>

            <div className="clima-info">
              <small>CONDICIONES ACTUALES</small>

              <h2>Despejado · 31°C</h2>

              <div className="clima-stats">
                <div>
                  <span>VIENTO</span>
                  <strong>11.4 km/h</strong>
                </div>

                <div>
                  <span>DIRECCIÓN</span>
                  <strong>174°</strong>
                </div>

                <div>
                  <span>NUBOSIDAD</span>
                  <strong>5%</strong>
                </div>
              </div>

              <div className="clima-alerta ok">
                Viento estable. Condiciones favorables para operación normal.
              </div>

            </div>

          </div>
        </div>

      </div>

      <div className="inicio-kpis">

        <div className="inicio-card mini-card">
          <span>LLEGADAS HOY</span>
          <h2>0</h2>
          <p>embarcaciones programadas</p>
        </div>

        <div className="inicio-card mini-card">
          <span>SALIDAS HOY</span>
          <h2>0</h2>
          <p>salidas programadas</p>
        </div>

        <div className="inicio-card mini-card">
          <span>OCUPADOS HOY</span>
          <h2>24</h2>
          <p>espacios con embarcación</p>
        </div>

        <div className="inicio-card mini-card">
          <span>LIBRES</span>
          <h2>183</h2>
          <p>espacios disponibles</p>
        </div>

      </div>

      <div className="inicio-card mapa-preview">
        <div className="mapa-header">
          <div>
            <h3>Vista general de la marina</h3>
            <span>17/05/2026</span>
          </div>

          <button>
            Ver mapa completo →
          </button>
        </div>

        <div className="mapa-box">
          MAPA AQUÍ
        </div>
      </div>

    </div>
  )
}

export default InicioAdmin