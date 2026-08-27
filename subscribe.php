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

        // 1. Send Email Notification to Site Owner
        $toAdmin = "anmolpokhriyal3200@gmail.com";
        $adminSubject = "🎉 New Amazon PPC Newsletter Subscriber: " . $email;
        $adminMessage = "Great news! You have a new blog subscriber:\n\n"
                 . "Subscriber Email: " . $email . "\n"
                 . "Subscribed At: " . date('Y-m-d H:i:s T') . "\n"
                 . "Source URL: " . (isset($input['url']) ? $input['url'] : 'Blog Sidebar') . "\n\n"
                 . "Total Active Subscribers: " . count($existing) . "\n"
                 . "Stored in: subscribers.json on your server.";
        $adminHeaders = "From: no-reply@" . (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'ppcgrowthexpert.com') . "\r\n" .
                       "Reply-To: " . $email . "\r\n" .
                       "X-Mailer: PHP/" . phpversion();

        @mail($toAdmin, $adminSubject, $adminMessage, $adminHeaders);

        // 2. Send Welcome Confirmation Email to Subscriber
        $subSubject = "✨ Welcome to PPC Growth Expert - Amazon PPC & Growth Insights";
        $subHtml = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: "Segoe UI", Arial, sans-serif; background-color: #f4f6f9; color: #1e293b; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .header { background: #0b1329; color: #ffffff; padding: 28px 24px; text-align: center; }
                .header h2 { margin: 0; font-size: 20px; font-weight: 800; color: #38bdf8; letter-spacing: 0.5px; }
                .content { padding: 32px 28px; }
                .title { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; line-height: 1.35; }
                .excerpt { font-size: 14.5px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
                .btn-wrapper { text-align: center; margin: 28px 0 20px; }
                .btn { background: linear-gradient(135deg, #1877ff 0%, #00b4d8 100%); color: #ffffff !important; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 14px; }
                .footer { background: #f8fafc; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>PPC GROWTH EXPERT</h2>
                    <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Amazon Advertising & Growth Insights</p>
                </div>
                <div class="content">
                    <h1 class="title">You\'re Subscribed! 🎉</h1>
                    <p class="excerpt">
                        Thank you for subscribing to Amazon Growth Insights by PPC Growth Expert. Every week, we share practical Amazon PPC strategies, ACoS reduction guides, search term tactics, and listing optimization experiments.
                    </p>
                    <p class="excerpt">
                        Check out our latest published strategy guide below:
                    </p>
                    <div class="btn-wrapper">
                        <a href="https://ppcgrowthexpert.com/blog-amazon-ppc-clicks-no-sales.html" class="btn" target="_blank">Read Latest Amazon PPC Guide →</a>
                    </div>
                </div>
                <div class="footer">
                    <p style="margin: 0 0 6px;">PPC Growth Expert · Founded by Anmol Pokhriyal</p>
                    <p style="margin: 0;">You received this email because you subscribed on ppcgrowthexpert.com</p>
                </div>
            </div>
        </body>
        </html>';

        $subHeaders  = "MIME-Version: 1.0\r\n";
        $subHeaders .= "Content-type: text/html; charset=UTF-8\r\n";
        $subHeaders .= "From: PPC Growth Expert <anmolpokhriyal3200@gmail.com>\r\n";
        $subHeaders .= "Reply-To: anmolpokhriyal3200@gmail.com\r\n";
        $subHeaders .= "X-Mailer: PHP/" . phpversion();

        @mail($email, $subSubject, $subHtml, $subHeaders);

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
