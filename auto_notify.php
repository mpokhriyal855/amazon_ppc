<?php
// auto_notify.php - Automatically broadcasts newly published blog posts to subscribers.json
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$subscribersFile = __DIR__ . '/subscribers.json';
$sentBlogsFile   = __DIR__ . '/sent_blogs.json';

// Ensure subscribers.json exists
$subscribers = [];
if (file_exists($subscribersFile)) {
    $subscribers = json_decode(file_get_contents($subscribersFile), true);
    if (!is_array($subscribers)) $subscribers = [];
}

if (empty($subscribers)) {
    echo json_encode(["status" => "info", "message" => "No subscribers found to notify."]);
    exit;
}

// Ensure sent_blogs.json exists
$sentBlogs = [];
if (file_exists($sentBlogsFile)) {
    $sentBlogs = json_decode(file_get_contents($sentBlogsFile), true);
    if (!is_array($sentBlogs)) $sentBlogs = [];
}

// Scan directory for all blog-*.html files
$blogFiles = glob(__DIR__ . '/blog-*.html');
$newlyNotified = [];

foreach ($blogFiles as $file) {
    $filename = basename($file);

    // Skip if this blog has already been broadcasted (unless ?force=1 is passed)
    $forceResend = isset($_GET['force']) && $_GET['force'] === '1';
    if (in_array($filename, $sentBlogs) && !$forceResend) {
        continue;
    }

    // Read HTML content to extract title, excerpt, and canonical URL
    $htmlContent = file_get_contents($file);
    
    // Extract Title
    $title = "New Amazon PPC Strategy Guide";
    if (preg_match('/<title>(.*?)<\/title>/is', $htmlContent, $matches)) {
        $title = trim(explode('|', $matches[1])[0]);
    }

    // Extract Meta Description Excerpt
    $excerpt = "";
    if (preg_match('/<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']/is', $htmlContent, $matches)) {
        $excerpt = trim($matches[1]);
    }

    // Determine Blog Full URL
    $blogUrl = "https://ppcgrowthexpert.com/" . $filename;
    if (preg_match('/<link\s+rel=["\']canonical["\']\s+href=["\'](.*?)["\']/is', $htmlContent, $matches)) {
        $blogUrl = trim($matches[1]);
    }

    // Send Broadcast Email to All Subscribers
    $subject = "🔥 New Amazon PPC Guide: " . $title;
    $sentCount = 0;

    foreach ($subscribers as $sub) {
        $toEmail = is_array($sub) ? $sub['email'] : $sub;
        if (filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {

            $emailBody = '
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
                    .badge { display: inline-block; background: #e0f2fe; color: #0284c7; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 50px; text-transform: uppercase; margin-bottom: 12px; }
                    .title { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; line-height: 1.35; }
                    .excerpt { font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
                    .btn-wrapper { text-align: center; margin: 32px 0 24px; }
                    .btn { background: linear-gradient(135deg, #1877ff 0%, #00b4d8 100%); color: #ffffff !important; padding: 14px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 15px; box-shadow: 0 4px 12px rgba(24, 119, 255, 0.25); }
                    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>PPC GROWTH EXPERT</h2>
                        <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Amazon Advertising & Growth Insights</p>
                    </div>
                    <div class="content">
                        <span class="badge">NEW STRATEGY POST</span>
                        <h1 class="title">' . htmlspecialchars($title) . '</h1>
                        ' . ($excerpt ? '<p class="excerpt">' . htmlspecialchars($excerpt) . '</p>' : '') . '
                        <div class="btn-wrapper">
                            <a href="' . htmlspecialchars($blogUrl) . '" class="btn" target="_blank">Read Full Guide Now →</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p style="margin: 0 0 6px;">PPC Growth Expert · Founded by Anmol Pokhriyal</p>
                        <p style="margin: 0;">You received this because you subscribed to Amazon Growth Insights on ppcgrowthexpert.com</p>
                    </div>
                </div>
            </body>
            </html>';

            $headers  = "MIME-Version: 1.0\r\n";
            $headers .= "Content-type: text/html; charset=UTF-8\r\n";
            $headers .= "From: PPC Growth Expert <anmolpokhriyal3200@gmail.com>\r\n";
            $headers .= "Reply-To: anmolpokhriyal3200@gmail.com\r\n";
            $headers .= "X-Mailer: PHP/" . phpversion();

            @mail($toEmail, $subject, $emailBody, $headers);
            $sentCount++;
        }
    }

    // Record this blog as sent so it won't be sent again
    $sentBlogs[] = $filename;
    $newlyNotified[] = [
        "file" => $filename,
        "title" => $title,
        "recipients" => $sentCount
    ];
}

// Update sent_blogs.json
file_put_contents($sentBlogsFile, json_encode($sentBlogs, JSON_PRETTY_PRINT));

echo json_encode([
    "status" => "success",
    "total_subscribers" => count($subscribers),
    "newly_broadcasted" => $newlyNotified,
    "all_sent_blogs" => $sentBlogs
]);
