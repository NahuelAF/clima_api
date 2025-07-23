
function degToCardinal(deg) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(deg / 45) % 8];
}

function formatDate(timestamp, timezone) {
  const localDate = new Date((timestamp + timezone) * 1000);
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long'
  }).format(localDate);
}

function formatTime(timestamp, timezone) {
  const localDate = new Date((timestamp + timezone) * 1000);
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC'
  }).format(localDate);
}


const AppState = {
  unit: localStorage.getItem('unit') || 'metric',
  theme: localStorage.getItem('theme') || 'light',
  city: localStorage.getItem('city') || 'Buenos Aires',
  get cacheDuration() {
    return 10 * 60 * 1000;
  }
};

function savePreferences() {
  localStorage.setItem('unit', AppState.unit);
  localStorage.setItem('theme', AppState.theme);
  localStorage.setItem('city', AppState.city);
}


const resultDiv = document.getElementById('weatherResult');
const forecastDiv = document.getElementById('forecastResult');

function renderWeather(data) {
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
    </div>`;

  if (Array.isArray(data.forecast)) {
    const now = new Date(Date.now() + data.timezone * 1000);
    now.setHours(0, 0, 0, 0);

    const filteredForecast = data.forecast.filter(f => new Date(f.date) >= now).slice(0, 6);

    forecastDiv.innerHTML = `<div class="forecast-container">${
      filteredForecast.map(f => {
        const day = new Date(f.date).toLocaleDateString('es-AR', { weekday: 'long' });
        return `
          <div class="forecast-card">
            <h4>${day}</h4>
            <img loading="lazy" src="https://openweathermap.org/img/wn/${f.icon}@2x.png" alt="${f.description}" width="50" height="50">
            <p>${f.temp_min}° / ${f.temp_max}°</p>
            <p>${f.description}</p>
          </div>`;
      }).join('')
    }</div>`;
  }
}


async function fetchWeather(city) {
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

async function fetchWeatherByLocation(lat, lon) {
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


const cityInput = document.getElementById('city');
const toggleUnitBtn = document.getElementById('toggleUnit');
const toggleThemeBtn = document.getElementById('toggleTheme');
const getLocationBtn = document.getElementById('getLocation');
const header = document.querySelector('.header');

cityInput.value = AppState.city;
toggleUnitBtn.textContent = AppState.unit === 'metric' ? '°C' : '°F';
toggleThemeBtn.textContent = AppState.theme === 'dark' ? '🌙' : '☀️';
if (AppState.theme === 'dark') document.body.classList.add('dark-mode');

let ticking = false;
function handleHeaderOpacity() {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      header.style.opacity = scrollY < 20 ? 1 : scrollY > 120 ? 0 : 1 - (scrollY - 20) / 100;
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeatherByLocation(pos.coords.latitude, pos.coords.longitude),
      () => fetchWeather(AppState.city)
    );
  } else {
    fetchWeather(AppState.city);
  }
  handleHeaderOpacity();
});

window.addEventListener('scroll', handleHeaderOpacity);

document.getElementById('weatherForm').addEventListener('submit', e => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
});

toggleUnitBtn.addEventListener('click', () => {
  AppState.unit = AppState.unit === 'metric' ? 'imperial' : 'metric';
  toggleUnitBtn.textContent = AppState.unit === 'metric' ? '°C' : '°F';
  savePreferences();
  fetchWeather(cityInput.value.trim() || AppState.city);
});

toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  AppState.theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  toggleThemeBtn.textContent = AppState.theme === 'dark' ? '🌙' : '☀️';
  savePreferences();
});

getLocationBtn?.addEventListener('click', () => {
  navigator.geolocation?.getCurrentPosition(
    pos => fetchWeatherByLocation(pos.coords.latitude, pos.coords.longitude),
    () => alert('No se pudo acceder a tu ubicación.')
  );
});
