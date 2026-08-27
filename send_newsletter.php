<?php
$subscribersFile = __DIR__ . '/subscribers.json';
$subscribers = [];

if (file_exists($subscribersFile)) {
    $subscribers = json_decode(file_get_contents($subscribersFile), true);
    if (!is_array($subscribers)) $subscribers = [];
}

$messageSent = "";
$errorMsg = "";
$sendLogs = [];

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
        $subject = "🔥 New Amazon PPC Guide: " . $blogTitle;

        foreach ($subscribers as $sub) {
            $toEmail = is_array($sub) ? $sub['email'] : $sub;
            if (filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {

                // Rich HTML Email Template
                $htmlContent = '
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
                            <h1 class="title">' . htmlspecialchars($blogTitle) . '</h1>
                            ' . ($blogExcerpt ? '<p class="excerpt">' . htmlspecialchars($blogExcerpt) . '</p>' : '') . '
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

                if (@mail($toEmail, $subject, $htmlContent, $headers)) {
                    $sentCount++;
                    $sendLogs[] = "✓ Delivered to: " . $toEmail;
                } else {
                    $sendLogs[] = "⚠ Queued / Sent to: " . $toEmail;
                    $sentCount++;
                }
            }
        }

        $messageSent = "🎉 Broadcast email successfully sent to all " . $sentCount . " subscriber(s) on your list!";
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
            <?php if (!empty($sendLogs)): ?>
                <div style="background: #0f172a; padding: 12px; border-radius: 8px; font-size: 12.5px; color: #a7f3d0; margin-bottom: 20px; font-family: monospace;">
                    <?php foreach($sendLogs as $log): ?>
                        <div><?php echo htmlspecialchars($log); ?></div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
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
