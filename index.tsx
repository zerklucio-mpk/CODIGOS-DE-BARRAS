import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Registro del Service Worker utilizando rutas relativas para evitar errores de construcción de URL
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Usar la ruta relativa directa es lo más robusto en la mayoría de los navegadores
    // El navegador resuelve automáticamente la ruta basándose en la ubicación de index.html
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(registration => {
        console.log('SW: Registrado con éxito en el alcance:', registration.scope);
      })
      .catch(err => {
        // Si hay un error de origen, lo reportamos pero no bloqueamos la app
        console.warn('SW: No se pudo registrar el Service Worker (esto es normal en algunos entornos de desarrollo):', err);
      });
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