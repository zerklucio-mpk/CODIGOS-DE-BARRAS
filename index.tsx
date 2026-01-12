import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Registro ultra-robusto para entornos de sandbox (Google AI Studio)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    try {
      // 1. Obtenemos la ruta base de la página actual (el sandbox .goog)
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      const directory = pathname.substring(0, pathname.lastIndexOf('/') + 1);
      
      // 2. Construimos la URL absoluta manualmente para forzar que el origen coincida
      // Esto evita que scripts cargados desde ai.studio resuelvan ./sw.js incorrectamente
      const swUrl = origin + directory + 'sw.js';
      
      console.log('SW: Intentando registro en:', swUrl);

      navigator.serviceWorker.register(swUrl, { scope: directory })
        .then(registration => {
          console.log('SW: Registrado correctamente en el sandbox.');
        })
        .catch(err => {
          // Si falla por origen en la vista previa, no es crítico para el funcionamiento local
          if (err.message.includes('origin')) {
            console.warn('SW: Bloqueado por seguridad del sandbox. Esto es normal en el editor. Funcionará al instalar/desplegar.');
          } else {
            console.error('SW: Error inesperado:', err);
          }
        });
    } catch (e) {
      console.error('SW: Error crítico en la lógica de registro:', e);
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);