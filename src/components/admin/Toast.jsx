import { useEffect, useCallback } from 'react'
import './Toast.css'

// Componente de notificación temporal (toast).
// Se muestra en la esquina superior derecha y desaparece automáticamente.
// tipo: 'success' | 'error' | 'warning'
function Toast({ mensaje, tipo = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, []) // 👈 array vacío — solo se ejecuta al montar

  return (
    <div className={`toast toast-${tipo}`}>
      <span className="toast-icono">
        {tipo === 'success' && '✓'}
        {tipo === 'error' && '✕'}
        {tipo === 'warning' && '⚠'}
      </span>
      <span>{mensaje}</span>
      <button type="button" className="toast-close" onClick={onClose}>×</button>
    </div>
  )
}

export default Toast