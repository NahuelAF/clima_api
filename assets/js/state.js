// assets/js/state.js

export const AppState = {
    unit: localStorage.getItem('unit') || 'metric',
    theme: localStorage.getItem('theme') || 'light',
    city: localStorage.getItem('city') || 'Buenos Aires',
    get cacheDuration() {
      return 10 * 60 * 1000; // 10 minutos
    }
  };
  
  export function savePreferences() {
    localStorage.setItem('unit', AppState.unit);
    localStorage.setItem('theme', AppState.theme);
    localStorage.setItem('city', AppState.city);
  }
  