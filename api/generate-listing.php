<?php
// PHP backend for Amazon Listing Generator
// Supports Anthropic Claude (default) and OpenAI Vision
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');
header('X-Accel-Buffering', 'no');

function fail($code, $msg) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => $msg]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail(405, 'POST only.');
}

// Check private config files if present
$candidateDirs = [
    __DIR__ . '/../private',
    dirname(__DIR__) . '/private',
    __DIR__ . '/..'
];
$configKeys = [];
foreach ($candidateDirs as $dir) {
    if (file_exists($dir . '/config.php')) {
        @include_once $dir . '/config.php';
    }
    if (file_exists($dir . '/ai-config.php')) {
        @include_once $dir . '/ai-config.php';
    }
}

// Read JSON input
$rawInput = file_get_contents('php://input');
$in = json_decode($rawInput, true);
if (!is_array($in)) {
    fail(400, 'Invalid JSON request.');
}

// Resolve API Key: HTTP header > JSON body > Environment variable > config variable
$headerKey = $_SERVER['HTTP_X_API_KEY'] ?? '';
if (!$headerKey && isset($_SERVER['HTTP_AUTHORIZATION'])) {
    if (preg_match('/Bearer\s+(.*)$/i', $_SERVER['HTTP_AUTHORIZATION'], $m)) {
        $headerKey = trim($m[1]);
    }
}
$bodyKey = $in['apiKey'] ?? '';

$anthropicKey = $headerKey ?: ($bodyKey ?: (getenv('ANTHROPIC_API_KEY') ?: ($configKeys['ANTHROPIC_API_KEY'] ?? ($ANTHROPIC_API_KEY ?? ''))));
$openaiKey    = getenv('OPENAI_API_KEY') ?: ($configKeys['OPENAI_API_KEY'] ?? ($OPENAI_API_KEY ?? ''));

// Determine provider:
// If key starts with 'sk-ant-', it's Anthropic.
// If key starts with 'sk-' (and not 'sk-ant-'), it's OpenAI.
$isAnthropic = (strpos($anthropicKey, 'sk-ant-') === 0);
$isOpenAI    = (strpos($anthropicKey, 'sk-') === 0 && !$isAnthropic) || (!empty($openaiKey) && empty($anthropicKey));

if ($isOpenAI && empty($openaiKey) && !empty($anthropicKey)) {
    $openaiKey = $anthropicKey;
}

if (empty($anthropicKey) && empty($openaiKey)) {
    fail(500, 'Server AI key is not configured. Please supply an Anthropic or OpenAI API key.');
}

// Rate limiting: 15 requests per 10 minutes per IP
$ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
$f = sys_get_temp_dir() . '/lg_' . md5($ip);
$t = array_filter(@json_decode(@file_get_contents($f), true) ?: [], fn($x) => $x > time() - 600);
$t[] = time();
@file_put_contents($f, json_encode(array_values($t)));
if (count($t) > 15) {
    fail(429, 'Too many requests. Please try again in a few minutes.');
}

$prompt = $in['prompt'] ?? null;
$images = $in['images'] ?? [];

if (!is_string($prompt) || strlen($prompt) < 20 || strlen($prompt) > 30000) {
    fail(400, 'Invalid prompt parameter.');
}
if (!is_array($images) || count($images) > 6) {
    fail(400, 'Maximum 6 images allowed.');
}

// Clean and validate base64 images
$cleanImages = [];
foreach ($images as $b) {
    if (!is_string($b) || strlen($b) > 8000000) {
        fail(400, 'Invalid image size or format.');
    }
    // Clean data URL prefix if present
    if (strpos($b, 'base64,') !== false) {
        $parts = explode('base64,', $b);
        $b = $parts[1];
    }
    $b = trim($b);
    if (!preg_match('/^[A-Za-z0-9+\/=]+$/', $b)) {
        fail(400, 'Invalid image encoding.');
    }
    $cleanImages[] = $b;
}

// Dispatch to Anthropic or OpenAI
if ($isAnthropic || (!empty($anthropicKey) && !$isOpenAI)) {
    $model = getenv('AI_MODEL') ?: ($in['model'] ?? 'claude-3-5-sonnet-20241022');
    // If someone passes claude-sonnet-5-5, use current sonnet model
    if ($model === 'claude-sonnet-5-5') {
        $model = 'claude-3-5-sonnet-20241022';
    }

    $content = [];
    foreach ($cleanImages as $b) {
        $content[] = [
            'type' => 'image',
            'source' => [
                'type' => 'base64',
                'media_type' => 'image/jpeg',
                'data' => $b
            ]
        ];
    }
    $content[] = ['type' => 'text', 'text' => $prompt];

    $body = json_encode([
        'model' => $model,
        'max_tokens' => 4096,
        'system' => 'You write Amazon product listings. Reply with one valid JSON object only. No markdown, no commentary.',
        'messages' => [['role' => 'user', 'content' => $content]],
    ]);

    $ch = curl_init('https://api.anthropic.com/v1/messages');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 120,
        CURLOPT_HTTPHEADER => [
            'content-type: application/json',
            'x-api-key: ' . $anthropicKey,
            'anthropic-version: 2023-06-01'
        ],
    ]);
    $out = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($curlErr) {
        fail(502, 'Failed to connect to Anthropic API: ' . $curlErr);
    }

    $j = json_decode($out, true);
    if ($status !== 200 || !isset($j['content'][0]['text'])) {
        $errMsg = $j['error']['message'] ?? 'The AI service failed. Please check your Anthropic API key or try again.';
        fail($status === 429 ? 429 : 502, $errMsg);
    }

    echo $j['content'][0]['text'];
    exit;

} else {
    // OpenAI Vision Flow
    $model = getenv('OPENAI_MODEL') ?: ($in['model'] ?? 'gpt-4o');

    $content = [];
    $content[] = ['type' => 'text', 'text' => $prompt];
    foreach ($cleanImages as $b) {
        $content[] = [
            'type' => 'image_url',
            'image_url' => [
                'url' => 'data:image/jpeg;base64,' . $b,
                'detail' => 'high'
            ]
        ];
    }

    $body = json_encode([
        'model' => $model,
        'messages' => [
            [
                'role' => 'system',
                'content' => 'You write Amazon product listings. Reply with one valid JSON object only. No markdown, no commentary.'
            ],
            [
                'role' => 'user',
                'content' => $content
            ]
        ],
        'response_format' => ['type' => 'json_object'],
        'max_tokens' => 4096,
        'temperature' => 0.5
    ]);

    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 120,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $openaiKey
        ],
    ]);
    $out = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($curlErr) {
        fail(502, 'Failed to connect to OpenAI API: ' . $curlErr);
    }

    $j = json_decode($out, true);
    if ($status !== 200 || !isset($j['choices'][0]['message']['content'])) {
        $errMsg = $j['error']['message'] ?? 'The OpenAI service failed. Please check your API key.';
        fail($status === 429 ? 429 : 502, $errMsg);
    }

    echo $j['choices'][0]['message']['content'];
    exit;
}
