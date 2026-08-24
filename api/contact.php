<?php
/**
 * Pure PHP Backend for Mailjet Email Integration
 * File: api/contact.php
 * Endpoint accepts POST requests from website forms and forwards emails via Mailjet Send API v3.1
 */

// Headers for CORS & JSON response
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed. Only POST is accepted.']);
    exit;
}

// --------------------------------------------------------------------------
// 1. MAILJET CONFIGURATION
// --------------------------------------------------------------------------
$apiKey = getenv('MAILJET_API_KEY') ?: 'YOUR_MAILJET_API_KEY';
$secretKey = getenv('MAILJET_SECRET_KEY') ?: 'YOUR_MAILJET_SECRET_KEY';
$senderEmail = getenv('MAILJET_SENDER_EMAIL') ?: 'anmolpokhriyal3200@gmail.com';
$senderName  = 'PPC Growth Expert Lead Form';

$recipients = [
    ['Email' => 'anmolpokhriyal3200@gmail.com', 'Name' => 'Anmol Pokhriyal'],
    ['Email' => 'pokhriyalmansi378@gmail.com',  'Name' => 'Mansi Pokhriyal']
];

// --------------------------------------------------------------------------
// 2. INPUT EXTRACTION (Supports JSON & Form URL Encoded POST)
// --------------------------------------------------------------------------
$rawInput = file_get_contents('php://input');
$data = [];

if (!empty($_POST)) {
    $data = $_POST;
} else {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $data = $decoded;
    }
}

// --------------------------------------------------------------------------
// 3. SPAM PROTECTION & RATE LIMITING
// --------------------------------------------------------------------------
// Honeypot check: If hidden honeypot field '_gotcha' or 'website' is filled, treat as spam silent success
if (!empty($data['_gotcha']) || !empty($data['website'])) {
    echo json_encode(['success' => true, 'message' => 'Submission processed.']);
    exit;
}

// IP-based Rate Limiting (Simple File/Session Check: Max 1 request per 3 seconds per IP)
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$tmpDir = sys_get_temp_dir();
$rateFile = $tmpDir . '/rate_' . md5($ip) . '.txt';
$currentTime = time();

if (file_exists($rateFile)) {
    $lastTime = (int)file_get_contents($rateFile);
    if (($currentTime - $lastTime) < 3) {
        http_response_code(429);
        echo json_encode(['success' => false, 'message' => 'Too many requests. Please wait a few seconds before trying again.']);
        exit;
    }
}
@file_put_contents($rateFile, (string)$currentTime);

// --------------------------------------------------------------------------
// 4. SANITIZATION & VALIDATION
// --------------------------------------------------------------------------
function sanitizeInput($value) {
    if (is_array($value)) {
        return implode(', ', array_map('sanitizeInput', $value));
    }
    return htmlspecialchars(trim((string)$value), ENT_QUOTES, 'UTF-8');
}

$name    = sanitizeInput($data['name'] ?? $data['fullName'] ?? $data['Client_Name'] ?? '');
$email   = sanitizeInput($data['email'] ?? $data['Client_Email'] ?? '');
$phone   = sanitizeInput($data['phone'] ?? $data['Client_Phone'] ?? '');
$message = sanitizeInput($data['message'] ?? $data['ASIN_Store_Link'] ?? $data['asinLink'] ?? '');
$subject = sanitizeInput($data['_subject'] ?? '');

// Custom fields for bundled services
$orderType         = sanitizeInput($data['Order_Type'] ?? '');
$requestedServices = sanitizeInput($data['Requested_Services'] ?? $data['serviceName'] ?? '');
$servicesBreakdown = sanitizeInput($data['Services_Breakdown'] ?? '');
$pricingSummary    = sanitizeInput($data['Pricing_Summary'] ?? '');

if (empty($subject)) {
    if (!empty($name)) {
        $subject = "⚡ Strategy Call Request from " . $name;
    } else {
        $subject = "⚡ New Lead Form Submission from Website";
    }
}

// Ensure required fields
if (empty($name) && empty($email) && empty($phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please fill in required contact fields.']);
    exit;
}

if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address provided.']);
    exit;
}

// --------------------------------------------------------------------------
// 5. BUILD EMAIL HTML BODY (Clean Table Layout Matching FormSubmit)
// --------------------------------------------------------------------------
$htmlBody = '
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    body { font-family: Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 20px 24px; color: #ffffff; text-align: left; }
    .header h2 { margin: 0; font-size: 18px; font-weight: 700; color: #ffffff; }
    .header p { margin: 4px 0 0; font-size: 12px; color: #94a3b8; }
    .content { padding: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; }
    th { background: #f8fafc; color: #475569; font-weight: 700; width: 35%; }
    td { color: #0f172a; font-weight: 500; }
    .footer { background: #f8fafc; padding: 14px 24px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
<div class="container">
    <div class="header">
        <h2>⚡ New Lead Submission — PPC Growth Expert</h2>
        <p>Received from ppcgrowthexpert.com website</p>
    </div>
    <div class="content">
        <table>';

$fieldsToDisplay = [
    'Client Name' => $name,
    'Client Email' => $email,
    'Client Phone' => $phone,
];

if (!empty($orderType)) $fieldsToDisplay['Order Type'] = $orderType;
if (!empty($requestedServices)) $fieldsToDisplay['Requested Services'] = $requestedServices;
if (!empty($servicesBreakdown)) $fieldsToDisplay['Services Breakdown'] = nl2br($servicesBreakdown);
if (!empty($pricingSummary)) $fieldsToDisplay['Pricing Summary'] = nl2br($pricingSummary);
if (!empty($message)) $fieldsToDisplay['Message / ASIN Link'] = nl2br($message);

foreach ($data as $key => $val) {
    if (in_array($key, ['name','fullName','Client_Name','email','Client_Email','phone','Client_Phone','message','ASIN_Store_Link','asinLink','_subject','_template','_captcha','_gotcha','website','Order_Type','Requested_Services','Services_Breakdown','Pricing_Summary','serviceName','isBundle','_to'])) {
        continue;
    }
    $cleanKey = ucwords(str_replace(['_', '-'], ' ', sanitizeInput($key)));
    $fieldsToDisplay[$cleanKey] = sanitizeInput($val);
}

foreach ($fieldsToDisplay as $label => $val) {
    if ($val !== '') {
        $htmlBody .= "<tr><th>{$label}</th><td>{$val}</td></tr>";
    }
}

$htmlBody .= '
        </table>
    </div>
    <div class="footer">
        Submitted via PPC Growth Expert Website Contact Form · Timestamp: ' . date('d M Y, h:i A T') . '
    </div>
</div>
</body>
</html>';

$textBody = "New Lead Submission from Website:\n\n";
foreach ($fieldsToDisplay as $label => $val) {
    $textBody .= "{$label}: " . strip_tags(str_replace('<br>', "\n", $val)) . "\n";
}

// --------------------------------------------------------------------------
// 6. MAILJET API REQUEST (v3.1 Send Endpoint)
// --------------------------------------------------------------------------
$mailjetPayload = [
    'Messages' => [
        [
            'From' => [
                'Email' => $senderEmail,
                'Name'  => $senderName
            ],
            'To' => $recipients,
            'Subject' => $subject,
            'TextPart' => $textBody,
            'HTMLPart' => $htmlBody
        ]
    ]
];

if (!empty($email)) {
    $mailjetPayload['Messages'][0]['ReplyTo'] = [
        'Email' => $email,
        'Name'  => $name ?: 'Website Visitor'
    ];
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.mailjet.com/v3.1/send');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($mailjetPayload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, $apiKey . ':' . $secretKey);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    // Fallback using stream_context if cURL fails
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n" .
                        "Authorization: Basic " . base64_encode($apiKey . ':' . $secretKey) . "\r\n",
            'content' => json_encode($mailjetPayload),
            'timeout' => 15
        ]
    ]);
    $response = @file_get_contents('https://api.mailjet.com/v3.1/send', false, $context);
    if ($response !== false) {
        $httpCode = 200;
    }
}

if ($httpCode >= 200 && $httpCode < 300) {
    echo json_encode(['success' => true, 'message' => 'Email sent successfully via Mailjet.']);
} else {
    http_response_code($httpCode >= 400 && $httpCode < 600 ? $httpCode : 500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to dispatch email via Mailjet.',
        'details' => json_decode($response, true) ?: $response
    ]);
}
