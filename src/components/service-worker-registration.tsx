'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        // El sitio sigue funcionando cuando el navegador no permite la PWA.
      });
    }
  }, []);

  return null;
}
