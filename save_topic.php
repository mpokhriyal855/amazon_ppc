<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$file = __DIR__ . '/topics.json';

// Default starter topics
$defaultTopics = [
    ["title" => "Scaling Broad Match Without ACoS Spikes", "votes" => 42, "isUser" => false],
    ["title" => "Amazon DSP vs Sponsored Display Strategy", "votes" => 38, "isUser" => false],
    ["title" => "How to Tackle Listing Hijackers & Buy Box Losses", "votes" => 29, "isUser" => false],
    ["title" => "A+ Content Conversion Rate Optimization", "votes" => 25, "isUser" => false]
];

// Ensure topics.json exists
if (!file_exists($file)) {
    file_put_contents($file, json_encode($defaultTopics, JSON_PRETTY_PRINT));
}

// GET request: Return all stored topics
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $content = @file_get_contents($file);
    $data = json_decode($content, true);
    if (!is_array($data) || empty($data)) {
        $data = $defaultTopics;
    }
    echo json_encode($data);
    exit;
}

// POST request: Add new topic & send email alert
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    if (!$input) {
        $input = $_POST;
    }
    
    $newTopic = isset($input['topic']) ? trim(strip_tags($input['topic'])) : '';

    if (!empty($newTopic)) {
        $content = @file_get_contents($file);
        $existing = json_decode($content, true);
        if (!is_array($existing)) {
            $existing = $defaultTopics;
        }

        // Check for duplicates
        $alreadyExists = false;
        foreach ($existing as $item) {
            $t = is_array($item) ? $item['title'] : $item;
            if (strcasecmp($t, $newTopic) === 0) {
                $alreadyExists = true;
                break;
            }
        }

        if (!$alreadyExists) {
            // Unshift new recommendation to top of list
            array_unshift($existing, [
                "title" => $newTopic,
                "votes" => 1,
                "isUser" => true,
                "date" => date('Y-m-d H:i:s')
            ]);
            file_put_contents($file, json_encode($existing, JSON_PRETTY_PRINT));
        }

        // Send Email Notification to Site Owner
        $to = "anmolpokhriyal3200@gmail.com";
        $subject = "🔥 New Amazon PPC Topic Recommendation Submitted!";
        $message = "You received a new community topic suggestion on PPC Growth Expert:\n\n"
                 . "Suggested Topic: " . $newTopic . "\n"
                 . "Submitted At: " . date('Y-m-d H:i:s T') . "\n"
                 . "IP Address: " . (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'Unknown') . "\n\n"
                 . "This topic is saved live in your server's topics.json file.";
        $headers = "From: no-reply@" . (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'ppcgrowthexpert.com') . "\r\n" .
                   "Reply-To: no-reply@" . (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'ppcgrowthexpert.com') . "\r\n" .
                   "X-Mailer: PHP/" . phpversion();

        @mail($to, $subject, $message, $headers);

        echo json_encode([
            "status" => "success",
            "message" => "Topic saved to server topics.json and email sent!",
            "topics" => $existing
        ]);
        exit;
    }
}

echo json_encode(["status" => "error", "message" => "No topic provided"]);
?>
