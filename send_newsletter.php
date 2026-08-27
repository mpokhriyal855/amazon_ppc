<?php
$subscribersFile = __DIR__ . '/subscribers.json';
$subscribers = [];

if (file_exists($subscribersFile)) {
    $subscribers = json_decode(file_get_contents($subscribersFile), true);
    if (!is_array($subscribers)) $subscribers = [];
}

$messageSent = "";
$errorMsg = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $secretKey = isset($_POST['secret_key']) ? trim($_POST['secret_key']) : '';
    $blogTitle = isset($_POST['blog_title']) ? trim($_POST['blog_title']) : '';
    $blogUrl   = isset($_POST['blog_url']) ? trim($_POST['blog_url']) : '';
    $blogExcerpt = isset($_POST['blog_excerpt']) ? trim($_POST['blog_excerpt']) : '';

    if ($secretKey !== 'ppc2026') {
        $errorMsg = "Incorrect admin password. Access denied.";
    } elseif (empty($blogTitle) || empty($blogUrl)) {
        $errorMsg = "Please fill in both Blog Title and Blog Link URL.";
    } elseif (empty($subscribers)) {
        $errorMsg = "No subscribers found in subscribers.json to send emails to.";
    } else {
        $sentCount = 0;
        $subject = "📢 New Amazon PPC Strategy: " . $blogTitle;

        $body = "Hi there,\n\n"
              . "We just published a brand new Amazon PPC & Growth guide on our blog:\n\n"
              . "📌 TITLE: " . $blogTitle . "\n\n"
              . ($blogExcerpt ? "💡 SUMMARY: " . $blogExcerpt . "\n\n" : "")
              . "🔗 READ THE FULL ARTICLE HERE:\n" . $blogUrl . "\n\n"
              . "Best regards,\n"
              . "Anmol Pokhriyal\n"
              . "PPC Growth Expert · https://ppcgrowthexpert.com\n\n"
              . "--------------------------------------------------\n"
              . "You received this email because you subscribed to Amazon Growth Insights on ppcgrowthexpert.com.";

        $headers = "From: PPC Growth Expert <anmolpokhriyal3200@gmail.com>\r\n" .
                   "Reply-To: anmolpokhriyal3200@gmail.com\r\n" .
                   "X-Mailer: PHP/" . phpversion();

        foreach ($subscribers as $sub) {
            $toEmail = is_array($sub) ? $sub['email'] : $sub;
            if (filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
                if (@mail($toEmail, $subject, $body, $headers)) {
                    $sentCount++;
                }
            }
        }

        $messageSent = "🎉 Broadcast sent successfully to " . $sentCount . " subscriber(s)!";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Newsletter Broadcast Dashboard - PPC Growth Expert</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1329; color: #f8fafc; padding: 40px 20px; margin: 0; }
        .card { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid #334155; }
        h1 { font-size: 22px; color: #38bdf8; margin-top: 0; }
        label { display: block; margin-top: 16px; font-weight: 600; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        input, textarea { width: 100%; box-sizing: border-box; padding: 12px; margin-top: 6px; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: #ffffff; font-size: 14px; }
        button { background: linear-gradient(135deg, #1877ff 0%, #00b4d8 100%); color: #fff; border: none; padding: 14px 24px; font-weight: 700; border-radius: 8px; cursor: pointer; margin-top: 24px; width: 100%; font-size: 15px; }
        button:hover { opacity: 0.9; }
        .alert-success { background: #064e3b; color: #34d399; padding: 12px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #059669; }
        .alert-error { background: #4c0519; color: #f87171; padding: 12px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #dc2626; }
        .stats { background: #0f172a; padding: 14px; border-radius: 8px; font-size: 14px; margin-bottom: 20px; color: #cbd5e1; display: flex; justify-content: space-between; }
    </style>
</head>
<body>
    <div class="card">
        <h1>📢 Send Blog Notification Newsletter</h1>
        <p style="color: #94a3b8; font-size: 14px;">Broadcast new blog posts automatically to all email subscribers in <code>subscribers.json</code>.</p>

        <div class="stats">
            <span>Total Subscribers: <strong><?php echo count($subscribers); ?></strong></span>
            <span>File: <code>subscribers.json</code></span>
        </div>

        <?php if ($messageSent): ?>
            <div class="alert-success"><?php echo htmlspecialchars($messageSent); ?></div>
        <?php endif; ?>

        <?php if ($errorMsg): ?>
            <div class="alert-error"><?php echo htmlspecialchars($errorMsg); ?></div>
        <?php endif; ?>

        <form method="POST">
            <label>Admin Password</label>
            <input type="password" name="secret_key" placeholder="Enter admin password (ppc2026)..." required>

            <label>Blog Post Title</label>
            <input type="text" name="blog_title" placeholder="e.g. Why Is My Amazon PPC ACoS So High and How Can I Reduce It?" required>

            <label>Blog Article URL Link</label>
            <input type="url" name="blog_url" placeholder="https://ppcgrowthexpert.com/blog-reduce-amazon-acos.html" required>

            <label>Short Excerpt / Summary (Optional)</label>
            <textarea name="blog_excerpt" rows="3" placeholder="Brief 2-line overview of what readers will learn in this post..."></textarea>

            <button type="submit">🚀 Send Email Notification to All Subscribers</button>
        </form>
    </div>
</body>
</html>
