<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$file = __DIR__ . '/subscribers.json';

// Ensure subscribers.json exists
if (!file_exists($file)) {
    file_put_contents($file, json_encode([], JSON_PRETTY_PRINT));
}

// GET request: Return subscriber count or list (admin)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $content = @file_get_contents($file);
    $data = json_decode($content, true);
    if (!is_array($data)) $data = [];
    
    // Protect full list if key not provided
    if (!isset($_GET['admin_key']) || $_GET['admin_key'] !== 'ppc2026') {
        echo json_encode(["status" => "success", "total_subscribers" => count($data)]);
        exit;
    }
    
    echo json_encode(["status" => "success", "total_subscribers" => count($data), "subscribers" => $data]);
    exit;
}

// POST request: Register new subscriber & send notification
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    if (!$input) {
        $input = $_POST;
    }

    $email = isset($input['email']) ? trim(filter_var($input['email'], FILTER_SANITIZE_EMAIL)) : '';

    if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $content = @file_get_contents($file);
        $existing = json_decode($content, true);
        if (!is_array($existing)) $existing = [];

        // Check if email already subscribed
        $alreadySubscribed = false;
        foreach ($existing as $item) {
            $e = is_array($item) ? $item['email'] : $item;
            if (strcasecmp($e, $email) === 0) {
                $alreadySubscribed = true;
                break;
            }
        }

        if (!$alreadySubscribed) {
            array_unshift($existing, [
                "email" => $email,
                "subscribed_at" => date('Y-m-d H:i:s T'),
                "ip" => isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'Unknown',
                "source_url" => isset($input['url']) ? $input['url'] : 'Blog Page'
            ]);
            file_put_contents($file, json_encode($existing, JSON_PRETTY_PRINT));
        }

        // Send Email Notification to Site Owner
        $to = "anmolpokhriyal3200@gmail.com";
        $subject = "🎉 New Amazon PPC Newsletter Subscriber: " . $email;
        $message = "Great news! You have a new blog subscriber:\n\n"
                 . "Subscriber Email: " . $email . "\n"
                 . "Subscribed At: " . date('Y-m-d H:i:s T') . "\n"
                 . "Source URL: " . (isset($input['url']) ? $input['url'] : 'Blog Sidebar') . "\n\n"
                 . "Total Active Subscribers: " . count($existing) . "\n"
                 . "Stored in: subscribers.json on your server.";
        $headers = "From: no-reply@" . (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'ppcgrowthexpert.com') . "\r\n" .
                   "Reply-To: " . $email . "\r\n" .
                   "X-Mailer: PHP/" . phpversion();

        @mail($to, $subject, $message, $headers);

        echo json_encode([
            "status" => "success",
            "message" => "Thank you for subscribing! You are now on our weekly Amazon Growth list.",
            "total_subscribers" => count($existing)
        ]);
        exit;
    } else {
        echo json_encode(["status" => "error", "message" => "Please provide a valid email address."]);
        exit;
    }
}

echo json_encode(["status" => "error", "message" => "Invalid request"]);
?>
