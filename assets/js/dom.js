// assets/js/dom.js

import { AppState } from './state.js';
import { degToCardinal, formatDate, formatTime } from './utils.js';

const resultDiv = document.getElementById('weatherResult');
const forecastDiv = document.getElementById('forecastResult');

export function renderWeather(data) {
  if (data.error) {
    resultDiv.innerHTML = `<p>${data.error}</p>`;
    forecastDiv.innerHTML = '';
    return;
  }

  const tempUnit = AppState.unit === 'metric' ? '°C' : '°F';
  const windUnit = AppState.unit === 'metric' ? 'm/s' : 'mph';

  const dateStr = formatDate(data.dt, data.timezone);
  const timeStr = formatTime(data.dt, data.timezone);
  const windDir = degToCardinal(data.wind?.deg || 0);
  const precipitation = data.rain?.['1h'] ? `${data.rain['1h']} mm (lluvia)` :
                        data.snow?.['1h'] ? `${data.snow['1h']} mm (nieve)` : '0 mm';

  resultDiv.innerHTML = `
    <div class="main-header">
      <div class="city-name">${data.name}, ${data.sys.country}</div>
      <div class="date">${dateStr}</div>
      <div class="time">${timeStr}</div>
      <div class="temperature">${Math.round(data.main.temp)}${tempUnit}</div>
      <div class="description">${data.weather[0].description}</div>
    </div>

    <div class="weather-info">
      <div class="weather-card"><h3>Precipitación</h3><p>${precipitation}</p></div>
      <div class="weather-card"><h3>Viento</h3><p>${data.wind.speed} ${windUnit} ${windDir}</p></div>
      <div class="weather-card"><h3>Presión</h3><p>${data.main.pressure} hPa</p></div>
      <div class="weather-card"><h3>Humedad</h3><p>${data.main.humidity} %</p></div>
    </div>
  `;

  if (Array.isArray(data.forecast)) {
    const now = new Date((Date.now() + data.timezone * 1000));
    now.setHours(0, 0, 0, 0);

    forecastDiv.innerHTML = `<div class="forecast-container">${
      data.forecast
        .filter(f => new Date(f.date) >= now)
        .slice(0, 6)
        .map(f => {
          const day = new Date(f.date).toLocaleDateString('es-AR', { weekday: 'long' });
          return `
            <div class="forecast-card">
              <h4>${day}</h4>
              <img src="https://openweathermap.org/img/wn/${f.icon}@2x.png" alt="${f.description}" width="50" height="50">
              <p>${f.temp_min}° / ${f.temp_max}°</p>
              <p>${f.description}</p>
            </div>`;
        }).join('')
    }</div>`;
  }
}
