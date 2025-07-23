// assets/js/utils.js

/**
 * Convierte grados en texto cardinal (e.g., N, NE, E, etc.)
 */
export function degToCardinal(deg) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  }
  
  export function formatDate(timestamp, timezone) {
    const localDate = new Date((timestamp + timezone) * 1000);
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long'
    }).format(localDate);
  }
  
  export function formatTime(timestamp, timezone) {
    const localDate = new Date((timestamp + timezone) * 1000);
    return new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC'
    }).format(localDate);
  }
  