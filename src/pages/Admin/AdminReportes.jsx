import './styles/AdminReportes.css'

function AdminReportes() {
  return (
    <div className="admin-reportes-page">

      <div className="admin-reportes-header">
        <div>
          <h1>Reportes</h1>
          <p>
            Consulta información estadística y genera reportes del sistema MARE.
          </p>
        </div>
      </div>

      <div className="admin-reportes-grid">

        <div className="report-card">
          <h3>Solicitudes aprobadas</h3>
          <span>128</span>
        </div>

        <div className="report-card">
          <h3>Solicitudes rechazadas</h3>
          <span>24</span>
        </div>

        <div className="report-card">
          <h3>Embarcaciones activas</h3>
          <span>52</span>
        </div>

        <div className="report-card">
          <h3>Espacios ocupados</h3>
          <span>78%</span>
        </div>

      </div>

      <div className="admin-reportes-section">
        <h2>Generación de reportes</h2>

        <div className="report-actions">

          <button className="report-btn">
            Descargar reporte PDF
          </button>

          <button className="report-btn secondary">
            Exportar estadísticas
          </button>

        </div>
      </div>

    </div>
  )
}

export default AdminReportes