import { useState } from 'react'
import { Anchor } from 'lucide-react'

import Reserve from '../pages/client/Reserve'

import '../styles/client.css'

// Layout público para el cliente.
// Muestra un botón flotante para abrir el formulario de reserva.
function ClientLayout() {
  const [showReserve, setShowReserve] = useState(false)

  return (
    <>
      <main className="client-main"></main>

      <div className="fab">
        <button
          type="button"
          className="fab-btn"
          onClick={() => setShowReserve(true)}
          title="Solicitar espacio"
        >
          <Anchor size={22} />
        </button>

        <span className="fab-label">Reservar</span>
      </div>

      {showReserve && (
        <Reserve onClose={() => setShowReserve(false)} />
      )}
    </>
  )
}

export default ClientLayout