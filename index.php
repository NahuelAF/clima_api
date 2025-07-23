<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Clima en tu ciudad - Consulta el pronóstico actualizado</title>
  
  <!-- SEO Meta -->
  <meta name="description" content="Consulta el clima actual y el pronóstico de los próximos días en tu ciudad. Compatible con geolocalización y unidades °C/°F." />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:title" content="Consulta del Clima" />
  <meta property="og:description" content="Mira el clima actual y los próximos días en tu ciudad o ubicación." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://tusitio.com" />
  <meta property="og:image" content="https://tusitio.com/assets/img/clima-preview.jpg" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Consulta del Clima" />
  <meta name="twitter:description" content="Consulta el clima actual y el pronóstico extendido." />
  <meta name="twitter:image" content="https://tusitio.com/assets/img/clima-preview.jpg" />

  <!-- Styles -->
  <link rel="stylesheet" href="assets/css/style.css" />
  <style>
    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
  </style>
</head>

<body>

  <!-- Encabezado accesible -->
  <header class="header" role="banner">
    <h1 class="visually-hidden">Aplicación de Consulta del Clima</h1>

    <form id="weatherForm" class="search-form" role="search" aria-label="Buscar ciudad">
      <input
        type="text"
        id="city"
        name="city"
        placeholder="Escribe el nombre de la ciudad"
        required
        autocomplete="off"
        aria-label="Nombre de la ciudad"
      />
      <button type="submit" aria-label="Buscar clima">Buscar</button>
    </form>

    <div class="buttons-right" role="group" aria-label="Opciones">
      <button id="toggleUnit" title="Cambiar unidad entre Celsius y Fahrenheit" aria-label="Cambiar unidad">°C</button>
      <button id="getLocation" title="Usar mi ubicación" aria-label="Usar mi ubicación actual">📍</button>
      <button id="toggleTheme" title="Modo oscuro o claro" aria-label="Cambiar tema de color">☀️</button>
    </div>
  </header>

  <!-- Contenido principal -->
  <main role="main">
    <section id="currentWeather" aria-labelledby="weather-heading">
      <h2 id="weather-heading">Clima actual</h2>
      <div id="weatherResult" class="weather-info" role="region" aria-live="polite"></div>
    </section>

    <section aria-labelledby="forecast-heading">
      <h2 id="forecast-heading" class="forecast-title">Pronóstico para los próximos días</h2>
      <div id="forecastResult" class="forecast-container"></div>
    </section>
  </main>

  <script src="assets/js/weather.bundle.js" defer></script>
</body>
</html>
