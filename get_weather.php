<?php
header('Content-Type: application/json');

$apiKey = 'fd98ba58b1ad47bceb91b394076825ac';

$units = 'metric';
if (isset($_POST['units']) && in_array($_POST['units'], ['metric', 'imperial'])) {
    $units = $_POST['units'];
}

$byCoords = isset($_POST['lat']) && isset($_POST['lon']);
$lat = $_POST['lat'] ?? null;
$lon = $_POST['lon'] ?? null;
$city = isset($_POST['city']) ? urlencode(trim($_POST['city'])) : null;

if ($byCoords) {
    // 🔹 Consulta por coordenadas
    $currentUrl = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lon}&appid={$apiKey}&units={$units}&lang=es";
} elseif ($city) {
    // 🔹 Consulta por ciudad
    $currentUrl = "https://api.openweathermap.org/data/2.5/weather?q={$city}&appid={$apiKey}&units={$units}&lang=es";
} else {
    echo json_encode(['error' => 'No se recibió ciudad ni coordenadas']);
    exit;
}

// Obtener clima actual
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $currentUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$currentResponse = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode != 200) {
    echo json_encode(['error' => 'Ciudad no encontrada o error en la API']);
    exit;
}

$currentData = json_decode($currentResponse, true);

// 🔁 Obtener pronóstico
if ($byCoords) {
    $forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lon}&appid={$apiKey}&units={$units}&lang=es";
} else {
    $forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q={$city}&appid={$apiKey}&units={$units}&lang=es";
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $forecastUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$forecastResponse = curl_exec($ch);
curl_close($ch);

$forecastData = json_decode($forecastResponse, true);

// Agrupar por días
$dailyForecast = [];
if (isset($forecastData['list']) && isset($forecastData['city']['timezone'])) {
    $timezoneOffset = $forecastData['city']['timezone'];

    foreach ($forecastData['list'] as $entry) {
        $timestamp = $entry['dt'] + $timezoneOffset;
        $localDate = date('Y-m-d', $timestamp);
        $localHour = (int)date('H', $timestamp);

        $today = date('Y-m-d', time() + $timezoneOffset);
        if ($localDate < $today) continue;

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

// Opcional: log para debug
// file_put_contents('debug_forecast.log', print_r($currentData, true));

echo json_encode($currentData);
