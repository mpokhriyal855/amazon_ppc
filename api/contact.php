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

$docRoot = rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/\\');
$homeDirectory = dirname($docRoot);

$configPath = $homeDirectory . '/private/mail-config.php';

$exceptionPath = $homeDirectory . '/private/phpmailer/Exception.php';
$phpMailerPath = $homeDirectory . '/private/phpmailer/PHPMailer.php';
$smtpPath = $homeDirectory . '/private/phpmailer/SMTP.php';

if (
    !file_exists($configPath) ||
    !file_exists($exceptionPath) ||
    !file_exists($phpMailerPath) ||
    !file_exists($smtpPath)
) {
    error_log('Contact form: required mail config or PHPMailer files are missing in ' . $homeDirectory . '/private/');

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Email service configuration error. Please ensure private/mail-config.php and private/phpmailer exist.'
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

try {
    $mail->isSMTP();

    $mail->Host = $config['smtp_host'];
    $mail->SMTPAuth = true;

    $mail->Username = $config['smtp_username'];
    $mail->Password = $config['smtp_password'];

    $port = (int)($config['smtp_port'] ?? 465);
    $mail->Port = $port;

    if ($port === 587) {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    } else {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    }

    $mail->CharSet = 'UTF-8';

    /*
    |--------------------------------------------------------------------------
    | Sender must remain your authenticated domain mailbox
    |--------------------------------------------------------------------------
    */

    $mail->setFrom(
        $config['from_email'],
        $config['from_name']
    );

    /*
    |--------------------------------------------------------------------------
    | Destination
    |--------------------------------------------------------------------------
    */

    $mail->addAddress(
        $config['to_email'],
        $config['to_name']
    );

    /*
    |--------------------------------------------------------------------------
    | Pressing Reply goes to the customer
    |--------------------------------------------------------------------------
    */

    $mail->addReplyTo(
        $email,
        $name
    );

    $mail->isHTML(true);

    $mail->Subject = 'Strategy Call Request - ' . $name;

    $mail->Body = "
        <div style=\"font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#111827;\">

            <h2 style=\"margin-bottom:20px;\">
                New Strategy Call Request
            </h2>

            <table cellpadding=\"8\" cellspacing=\"0\" style=\"width:100%;border-collapse:collapse;\">

                <tr>
                    <td style=\"font-weight:bold;width:120px;\">Name</td>
                    <td>{$safeName}</td>
                </tr>

                <tr>
                    <td style=\"font-weight:bold;\">Email</td>
                    <td>{$safeEmail}</td>
                </tr>

                <tr>
                    <td style=\"font-weight:bold;\">Phone</td>
                    <td>{$safePhone}</td>
                </tr>

                <tr>
                    <td style=\"font-weight:bold;vertical-align:top;\">Message</td>
                    <td>" . nl2br($safeMessage) . "</td>
                </tr>

            </table>

            <hr style=\"margin:24px 0;border:0;border-top:1px solid #e5e7eb;\">

            <p style=\"font-size:12px;color:#6b7280;\">
                Submitted through ppcgrowthexpert.com
            </p>

        </div>
    ";

    $mail->AltBody =
        "New Strategy Call Request\n\n" .
        "Name: {$name}\n" .
        "Email: {$email}\n" .
        "Phone: {$phone}\n\n" .
        "Message:\n" .
        ($message !== '' ? $message : 'No additional message provided');

    $mail->send();

    echo json_encode([
        'success' => true,
        'message' => 'Your request has been submitted successfully.'
    ]);

} catch (Exception $e) {

    error_log(
        'Contact form PHPMailer error: ' .
        $mail->ErrorInfo
    );

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'We could not send your request right now. Please try again.'
    ]);
}
