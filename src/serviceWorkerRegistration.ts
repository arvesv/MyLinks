/**
 * Registers the Service Worker for offline capability when supported.
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Service workers require secure context (HTTPS, localhost, 127.0.0.1)
      const isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
          window.location.hostname === '[::1]' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
      );

      if (window.isSecureContext || isLocalhost) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[SW] Registered successfully with scope:', registration.scope);

            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      console.log('[SW] New version available.');
                    } else {
                      console.log('[SW] Content cached for offline use.');
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn('[SW] Registration failed:', error);
          });
      }
    });
  }
}
