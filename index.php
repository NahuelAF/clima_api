<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Consulta de Clima</title>
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

  <h1 class="visually-hidden">Aplicación de Consulta del Clima</h1>

  <!-- Encabezado con buscador y botones -->
  <header class="header">
    <form id="weatherForm" class="search-form" role="search" aria-label="Buscar ciudad">
      <input
        type="text"
        id="city"
        name="city"
        placeholder="Escribe el nombre de la ciudad"
        required
        autocomplete="off"
      />
      <button type="submit">Buscar</button>
    </form>

    <div class="buttons-right">
      <button id="toggleUnit" title="Cambiar unidad">°C</button>
      <button id="getLocation" title="Usar mi ubicación">📍</button>
      <button id="toggleTheme" title="Modo oscuro/claro">☀️</button>
    </div>
  </header>

  <!-- Contenido principal -->
  <main>
    <div id="weatherResult" class="weather-info"></div>

    <h2 class="forecast-title">Próximos días</h2>
    <div id="forecastResult" class="forecast-container"></div>
  </main>

  <script type="module" src="assets/js/app.js"></script>

</body>
</html>
