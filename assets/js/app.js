// assets/js/app.js

import { AppState, savePreferences } from './state.js';
import { fetchWeather, fetchWeatherByLocation } from './api.js';
import { renderWeather } from './dom.js';

const cityInput = document.getElementById('city');
const toggleUnitBtn = document.getElementById('toggleUnit');
const toggleThemeBtn = document.getElementById('toggleTheme');
const getLocationBtn = document.getElementById('getLocation');
const header = document.querySelector('.header');

// Init UI con preferencias
cityInput.value = AppState.city;
toggleUnitBtn.textContent = AppState.unit === 'metric' ? '°C' : '°F';
toggleThemeBtn.textContent = AppState.theme === 'dark' ? '🌙' : '☀️';

if (AppState.theme === 'dark') document.body.classList.add('dark-mode');

// Scroll fade del header
function handleHeaderOpacity() {
  const scrollY = window.scrollY;
  header.style.opacity = scrollY < 20 ? 1 : scrollY > 120 ? 0 : 1 - (scrollY - 20) / 100;
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
    err => alert('No se pudo acceder a tu ubicación.')
  );
});
