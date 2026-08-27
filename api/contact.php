<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Paths outside public_html
|--------------------------------------------------------------------------
*/

$candidatePrivateDirs = array_unique([
    dirname(rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/\\')) . '/private',
    realpath(__DIR__ . '/../../private') ?: (__DIR__ . '/../../private'),
    realpath(__DIR__ . '/../private') ?: (__DIR__ . '/../private'),
    rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/\\') . '/../private'
]);

$configNames = ['mail-config.php', 'main_config.php', 'mail_config.php', 'config.php'];

$privateDir = null;
$configPath = null;

foreach ($candidatePrivateDirs as $dir) {
    if (!$dir || !is_dir($dir)) continue;
    foreach ($configNames as $cName) {
        if (file_exists($dir . '/' . $cName)) {
            $privateDir = $dir;
            $configPath = $dir . '/' . $cName;
            break 2;
        }
    }
}

if (!$privateDir) {
    $privateDir = $candidatePrivateDirs[0];
}

// Support PHPMailer files in /private/phpmailer/ OR directly in /private/
$exceptionPath = file_exists($privateDir . '/phpmailer/Exception.php') 
    ? $privateDir . '/phpmailer/Exception.php' 
    : $privateDir . '/Exception.php';

$phpMailerPath = file_exists($privateDir . '/phpmailer/PHPMailer.php') 
    ? $privateDir . '/phpmailer/PHPMailer.php' 
    : $privateDir . '/PHPMailer.php';

$smtpPath = file_exists($privateDir . '/phpmailer/SMTP.php') 
    ? $privateDir . '/phpmailer/SMTP.php' 
    : $privateDir . '/SMTP.php';

if (
    !$configPath ||
    !file_exists($configPath) ||
    !file_exists($exceptionPath) ||
    !file_exists($phpMailerPath) ||
    !file_exists($smtpPath)
) {
    error_log('Contact form error: Missing configuration or PHPMailer in ' . $privateDir);

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Private mail configuration missing. Please verify main_config.php (or mail-config.php) and PHPMailer files exist in: ' . $privateDir
    ]);

    exit;
}

require $exceptionPath;
require $phpMailerPath;
require $smtpPath;

$config = require $configPath;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/*
|--------------------------------------------------------------------------
| Read fields
|--------------------------------------------------------------------------
*/

$name = trim((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$phone = trim((string)($_POST['phone'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

/*
|--------------------------------------------------------------------------
| Required fields
|--------------------------------------------------------------------------
*/

if ($name === '' || $email === '' || $phone === '') {
    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Name, email and phone number are required.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Length limits
|--------------------------------------------------------------------------
*/

if (
    strlen($name) > 100 ||
    strlen($email) > 254 ||
    strlen($phone) > 30 ||
    strlen($message) > 3000
) {
    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'One or more fields are too long.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Email validation
|--------------------------------------------------------------------------
*/

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Please enter a valid email address.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Phone validation
|--------------------------------------------------------------------------
*/

if (!preg_match('/^[0-9+\-\s().]{7,20}$/', $phone)) {
    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Please enter a valid phone number.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Header injection protection
|--------------------------------------------------------------------------
*/

$name = preg_replace('/[\r\n]+/', ' ', $name);
$email = str_replace(["\r", "\n"], '', $email);
$phone = preg_replace('/[\r\n]+/', ' ', $phone);

/*
|--------------------------------------------------------------------------
| Escape customer data before placing it into HTML email
|--------------------------------------------------------------------------
*/

$safeName = htmlspecialchars($name, ENT_QUOTES | ENT_HTML5, 'UTF-8');
$safeEmail = htmlspecialchars($email, ENT_QUOTES | ENT_HTML5, 'UTF-8');
$safePhone = htmlspecialchars($phone, ENT_QUOTES | ENT_HTML5, 'UTF-8');

$safeMessage = htmlspecialchars(
    $message !== '' ? $message : 'No additional message provided',
    ENT_QUOTES | ENT_HTML5,
    'UTF-8'
);

/*
|--------------------------------------------------------------------------
| Send through Titan / GoDaddy SMTP
|--------------------------------------------------------------------------
*/

$mail = new PHPMailer(true);

$smtpSuccess = false;
$lastError = '';

// Prepare HTML body and headers
$mail->CharSet = 'UTF-8';
$mail->setFrom($config['from_email'], $config['from_name']);
$mail->addAddress($config['to_email'], $config['to_name']);
$mail->addReplyTo($email, $name);
$mail->isHTML(true);
$mail->Subject = 'Strategy Call Request - ' . $name;

$mail->Body = "
    <div style=\"font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#111827;\">
        <h2 style=\"margin-bottom:20px;\">New Strategy Call Request</h2>
        <table cellpadding=\"8\" cellspacing=\"0\" style=\"width:100%;border-collapse:collapse;\">
            <tr><td style=\"font-weight:bold;width:120px;\">Name</td><td>{$safeName}</td></tr>
            <tr><td style=\"font-weight:bold;\">Email</td><td>{$safeEmail}</td></tr>
            <tr><td style=\"font-weight:bold;\">Phone</td><td>{$safePhone}</td></tr>
            <tr><td style=\"font-weight:bold;vertical-align:top;\">Message</td><td>" . nl2br($safeMessage) . "</td></tr>
        </table>
        <hr style=\"margin:24px 0;border:0;border-top:1px solid #e5e7eb;\">
        <p style=\"font-size:12px;color:#6b7280;\">Submitted through ppcgrowthexpert.com</p>
    </div>
";

$mail->AltBody = "New Strategy Call Request\n\nName: {$name}\nEmail: {$email}\nPhone: {$phone}\n\nMessage:\n" . ($message !== '' ? $message : 'No additional message provided');

// Strategy 1 (Instant - < 0.1 seconds): Native PHP mail() with -f Return-Path
$to = $config['to_email'] ?? 'contact@ppcgrowthexpert.com';
$from = $config['from_email'] ?? 'contact@ppcgrowthexpert.com';
$subject = 'Strategy Call Request - ' . $name;

$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: ' . $config['from_name'] . ' <' . $from . '>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion()
];

// -f flag forces envelope sender so cPanel Exim delivers directly to Titan / Gmail with valid SPF
$mailSent = @mail($to, $subject, $mail->Body, implode("\r\n", $headers), '-f' . $from);

if ($mailSent) {
    $smtpSuccess = true;
    error_log('Contact form: Instant delivery via Native PHP mail() with -f flag.');
}

// Strategy 2 (Fallback): Explicit IPv4 Local SMTP Relay (127.0.0.1:25)
if (!$smtpSuccess) {
    try {
        $mail->isSMTP();
        $mail->Host = '127.0.0.1'; // Use explicit IPv4 IP to avoid 15s IPv6 ::1 DNS lookup timeout
        $mail->Port = 25;
        $mail->SMTPAuth = false;
        $mail->SMTPSecure = '';
        $mail->SMTPAutoTLS = false;
        $mail->Timeout = 2;

        $mail->send();
        $smtpSuccess = true;
        error_log('Contact form: Sent via 127.0.0.1 Local SMTP Relay.');
    } catch (Exception $e1) {
        $lastError = $e1->getMessage();
        error_log('Local 127.0.0.1 SMTP Relay failed: ' . $lastError);
    }
}

// Strategy 3: Native PHP mail() with -f Envelope Sender flag (Guaranteed delivery on GoDaddy cPanel)
if (!$smtpSuccess) {
    $to = $config['to_email'] ?? 'contact@ppcgrowthexpert.com';
    $from = $config['from_email'] ?? 'contact@ppcgrowthexpert.com';
    $subject = 'Strategy Call Request - ' . $name;

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . $config['from_name'] . ' <' . $from . '>',
        'Reply-To: ' . $email,
        'X-Mailer: PHP/' . phpversion()
    ];

    // -f flag sets Return-Path to from_email so SPF/DKIM passes for Titan & Gmail
    $mailSent = @mail($to, $subject, $mail->Body, implode("\r\n", $headers), '-f' . $from);

    if ($mailSent) {
        $smtpSuccess = true;
        error_log('Contact form: Sent via Native PHP mail() with -f flag.');
    }
}

if ($smtpSuccess) {
    echo json_encode([
        'success' => true,
        'message' => 'Your strategy call request has been received!'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not send message: ' . ($lastError ?: 'Mail delivery failed.')
    ]);
}
