let currentUnit = 'metric';
const cityInput = document.getElementById('city');
const resultDiv = document.getElementById('weatherResult');
const forecastDiv = document.getElementById('forecastResult');

const toggleUnitBtn = document.getElementById('toggleUnit');
const toggleThemeBtn = document.getElementById('toggleTheme');
const getLocationBtn = document.getElementById('getLocation');
const header = document.querySelector('.header');

async function fetchWeather(city) {
  resultDiv.innerHTML = 'Consultando clima...';
  forecastDiv.innerHTML = '';

  try {
    const response = await fetch('get_weather.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `city=${encodeURIComponent(city)}&units=${currentUnit}`
    });

    const data = await response.json();

    if (data.error) {
      resultDiv.textContent = data.error;
      forecastDiv.innerHTML = '';
      return;
    }

    renderWeather(data);

  } catch (error) {
    resultDiv.textContent = 'Error al consultar el clima.';
    forecastDiv.innerHTML = '';
    console.error(error);
  }
}

async function fetchWeatherByLocation(lat, lon) {
  resultDiv.innerHTML = 'Consultando clima por ubicación...';
  forecastDiv.innerHTML = '';

  try {
    const response = await fetch('get_weather.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `lat=${lat}&lon=${lon}&units=${currentUnit}`
    });

    const data = await response.json();

    if (data.name) {
      cityInput.value = data.name;
    }

    if (data.error) {
      resultDiv.textContent = data.error;
      forecastDiv.innerHTML = '';
      return;
    }

    renderWeather(data);

  } catch (error) {
    resultDiv.textContent = 'No se pudo obtener el clima por ubicación.';
    forecastDiv.innerHTML = '';
    console.error(error);
  }
}

function renderWeather(data) {
  const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
  const windUnit = currentUnit === 'metric' ? 'm/s' : 'mph';

  const localTimestamp = (data.dt + data.timezone) * 1000;
  const localDate = new Date(localTimestamp);

  const dateStr = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long'
  }).format(localDate);

  const timeStr = new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'UTC'
  }).format(localDate);

  let precipitation = '0 mm';
  if (data.rain?.['1h']) {
    precipitation = `${data.rain['1h']} mm (lluvia)`;
  } else if (data.snow?.['1h']) {
    precipitation = `${data.snow['1h']} mm (nieve)`;
  }

  function degToCardinal(deg) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  }
  const windDirection = data.wind?.deg ? degToCardinal(data.wind.deg) : 'N/A';

  const mainHeaderHTML = `
    <div class="main-header">
      <div class="city-name">${data.name}, ${data.sys.country}</div>
      <div class="date">${dateStr}</div>
      <div class="time">${timeStr}</div>
      <div class="temperature">${Math.round(data.main.temp)}${tempUnit}</div>
      <div class="description">${data.weather[0].description}</div>
    </div>
  `;

  const weatherInfoHTML = `
    <div class="weather-info">
      <div class="weather-card"><h3>Precipitación</h3><p>${precipitation}</p></div>
      <div class="weather-card"><h3>Viento</h3><p>${data.wind.speed} ${windUnit} ${windDirection}</p></div>
      <div class="weather-card"><h3>Presión</h3><p>${data.main.pressure} hPa</p></div>
      <div class="weather-card"><h3>Humedad</h3><p>${data.main.humidity} %</p></div>
    </div>
  `;

  resultDiv.innerHTML = mainHeaderHTML + weatherInfoHTML;

  // Pronóstico
  if (Array.isArray(data.forecast) && data.forecast.length > 0) {
    const nowUTC = new Date();
    const now = new Date(nowUTC.getTime() + data.timezone * 1000);
    now.setHours(0, 0, 0, 0);

    const forecastHTML = data.forecast
      .map(day => {
        const date = new Date(day.date);
        date.setHours(0, 0, 0, 0);
        return { ...day, dateObj: date };
      })
      .filter(day => day.dateObj >= now)
      .slice(0, 6)
      .map(day => {
        const dayName = day.dateObj.toLocaleDateString('es-AR', { weekday: 'long' });
        return `
          <div class="forecast-card">
            <h4>${dayName}</h4>
            <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.description}">
            <p>${day.temp_min}° / ${day.temp_max}°</p>
            <p>${day.description}</p>
          </div>`;
      }).join('');

    forecastDiv.innerHTML = `<div class="forecast-container">${forecastHTML}</div>`;
  } else {
    forecastDiv.innerHTML = '<p>No hay datos de pronóstico.</p>';
  }
}

// Ocultar header al hacer scroll
function handleHeaderOpacity() {
  const scrollY = window.scrollY || window.pageYOffset;
  const fadeStart = 20;
  const fadeEnd = 120;
  let opacity = 1;

  if (scrollY <= fadeStart) {
    opacity = 1;
  } else if (scrollY >= fadeEnd) {
    opacity = 0;
  } else {
    opacity = 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart);
  }

  header.style.opacity = opacity;
}

window.addEventListener('DOMContentLoaded', () => {
  // Intentar ubicación automática
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        fetchWeatherByLocation(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        fetchWeather('Buenos Aires');
      }
    );
  } else {
    fetchWeather('Buenos Aires');
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
  currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
  toggleUnitBtn.textContent = currentUnit === 'metric' ? '°C' : '°F';
  const city = cityInput.value.trim() || 'Buenos Aires';
  fetchWeather(city);
});

toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  toggleThemeBtn.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '☀️';
});

getLocationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        fetchWeatherByLocation(pos.coords.latitude, pos.coords.longitude);
      },
      err => {
        alert('No se pudo acceder a tu ubicación.');
        console.warn(err.message);
      }
    );
  } else {
    alert('Tu navegador no soporta geolocalización.');
  }
});
