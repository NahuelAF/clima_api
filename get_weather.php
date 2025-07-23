<?php
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY'); // evita que se embeba en iframes
header('X-XSS-Protection: 1; mode=block'); // protección básica XSS
header('Referrer-Policy: no-referrer'); // privacidad de navegación

// Cargar API key desde variable de entorno para no exponerla en el código
$apiKey = getenv('OPENWEATHER_API_KEY');
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'Configuración del servidor incompleta (API key faltante)']);
    exit;
}

// Unidades permitidas
$validUnits = ['metric', 'imperial'];

// Obtener y validar la unidad
$units = 'metric';
if (isset($_POST['units']) && in_array($_POST['units'], $validUnits, true)) {
    $units = $_POST['units'];
}

// Validar coordenadas
$byCoords = isset($_POST['lat'], $_POST['lon']);
$lat = null;
$lon = null;

if ($byCoords) {
    $lat = filter_var($_POST['lat'], FILTER_VALIDATE_FLOAT);
    $lon = filter_var($_POST['lon'], FILTER_VALIDATE_FLOAT);

    if ($lat === false || $lat < -90 || $lat > 90 || $lon === false || $lon < -180 || $lon > 180) {
        http_response_code(400);
        echo json_encode(['error' => 'Coordenadas inválidas']);
        exit;
    }
}

// Validar ciudad
$city = null;
if (!$byCoords && isset($_POST['city'])) {
    $cityRaw = trim($_POST['city']);
    // Validar longitud y caracteres (letras, espacios, guiones, acentos)
    if (mb_strlen($cityRaw) > 100 || !preg_match('/^[\p{L}\s\-]+$/u', $cityRaw)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nombre de ciudad inválido']);
        exit;
    }
    $city = urlencode($cityRaw);
}

if (!$byCoords && !$city) {
    http_response_code(400);
    echo json_encode(['error' => 'No se recibió ciudad ni coordenadas']);
    exit;
}

// Función para hacer llamada a API con curl
function callApi(string $url): array {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$response, $httpcode];
}

// Construir URL para clima actual
if ($byCoords) {
    $currentUrl = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lon}&appid={$apiKey}&units={$units}&lang=es";
} else {
    $currentUrl = "https://api.openweathermap.org/data/2.5/weather?q={$city}&appid={$apiKey}&units={$units}&lang=es";
}

// Obtener clima actual
list($currentResponse, $httpcode) = callApi($currentUrl);
if ($httpcode !== 200) {
    http_response_code(404);
    echo json_encode(['error' => 'Ciudad no encontrada o error en la API']);
    exit;
}
$currentData = json_decode($currentResponse, true);

// Construir URL para pronóstico
if ($byCoords) {
    $forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lon}&appid={$apiKey}&units={$units}&lang=es";
} else {
    $forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q={$city}&appid={$apiKey}&units={$units}&lang=es";
}

// Obtener pronóstico
list($forecastResponse, $forecastHttpCode) = callApi($forecastUrl);

if ($forecastHttpCode !== 200) {
    // No detiene la respuesta, solo no muestra pronóstico
    $currentData['forecast'] = [];
} else {
    $forecastData = json_decode($forecastResponse, true);

    $dailyForecast = [];
    if (isset($forecastData['list']) && isset($forecastData['city']['timezone'])) {
        $timezoneOffset = $forecastData['city']['timezone'];

        foreach ($forecastData['list'] as $entry) {
            $timestamp = $entry['dt'] + $timezoneOffset;
            $localDate = date('Y-m-d', $timestamp);
            $localHour = (int)date('H', $timestamp);

            $today = date('Y-m-d', time() + $timezoneOffset);
            if ($localDate < $today) continue;

            // Tomar pronóstico entre 11 y 14 hs para cada día
            if ($localHour >= 11 && $localHour <= 14 && !isset($dailyForecast[$localDate])) {
                $dailyForecast[$localDate] = [
                    'date' => $localDate,
                    'temp_min' => round($entry['main']['temp_min']),
                    'temp_max' => round($entry['main']['temp_max']),
                    'description' => $entry['weather'][0]['description'],
                    'icon' => $entry['weather'][0]['icon']
                ];
            }
        }
    }

    $currentData['forecast'] = array_values($dailyForecast);
}

echo json_encode($currentData);
