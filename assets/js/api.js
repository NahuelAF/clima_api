// assets/js/api.js

import { AppState, savePreferences } from './state.js';
import { renderWeather } from './dom.js';

export async function fetchWeather(city) {
  const cacheKey = `weatherCache_${city}_${AppState.unit}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < AppState.cacheDuration) {
      renderWeather(data);
      return;
    }
  }

  try {
    const res = await fetch('get_weather.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `city=${encodeURIComponent(city)}&units=${AppState.unit}`
    });

    const data = await res.json();
    if (data.error) return renderWeather({ error: data.error });

    localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
    AppState.city = city;
    savePreferences();
    renderWeather(data);

  } catch (e) {
    console.error(e);
    renderWeather({ error: 'Error al consultar el clima.' });
  }
}

export async function fetchWeatherByLocation(lat, lon) {
  try {
    const res = await fetch('get_weather.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `lat=${lat}&lon=${lon}&units=${AppState.unit}`
    });

    const data = await res.json();
    if (data.name) AppState.city = data.name;
    savePreferences();
    renderWeather(data);

  } catch (e) {
    console.error(e);
    renderWeather({ error: 'Error de ubicación.' });
  }
}
